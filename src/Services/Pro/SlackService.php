<?php

namespace Solspace\Freeform\Services\Pro;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\Events\Webhooks\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;
use Solspace\Freeform\Library\Webhooks\WebhookInterface;
use Solspace\Freeform\Records\Pro\WebhookRecord;
use Solspace\Freeform\Services\BaseService;
use Solspace\Freeform\Webhooks\Integrations\Slack;

class SlackService extends BaseService
{
    const EVENT_BEFORE_SAVE   = 'beforeSave';
    const EVENT_AFTER_SAVE    = 'afterSave';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE  = 'afterDelete';

    /**
     * @param AfterSubmitEvent $event
     */
    public function triggerWebhooks(AfterSubmitEvent $event)
    {
        $form       = $event->getForm();
        $submission = $event->getSubmission();

        $client = new Client();

        $webhooks = $this->getWebhooksForForm($form);
        foreach ($webhooks as $webhook) {
            $message = $webhook->settings['message'] ?? '';
            $message = \Craft::$app->view->renderString($message, [
                'form'       => $form,
                'submission' => $submission,
            ]);

            if (!$message) {
                continue;
            }

            try {
                $client->post($webhook->getWebhook(), [
                    'json' => ['text' => $message],
                ]);
            } catch (\Exception $e) {
                Freeform::getInstance()->logger->getLogger('Slack')->error($e->getMessage());
            }
        }
    }

    /**
     * @return array|Slack[]
     */
    public function getAllWebhooks(): array
    {
        return Freeform::getInstance()->webhooks->getAllByType(Slack::class);
    }

    /**
     * @param int $id
     *
     * @return null|WebhookInterface|Slack
     */
    public function getWebhookById($id)
    {
        return Freeform::getInstance()->webhooks->getById($id);
    }

    /**
     * @param Form $form
     *
     * @return WebhookInterface[]
     */
    private function getWebhooksForForm(Form $form): array
    {
        return Freeform::getInstance()->webhooks->getWebhooksFor([$form->getId()], Slack::class);
    }

    /**
     * @param AbstractWebhook $webhook
     *
     * @return array
     */
    public function getSelectedFormsFor(AbstractWebhook $webhook): array
    {
        return Freeform::getInstance()->webhooks->getSelectedFormsFor($webhook);
    }

    /**
     * @param int $id
     *
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete($id)
    {
        return Freeform::getInstance()->webhooks->deleteById($id);
    }

    /**
     * @param Slack $webhook
     * @param array $formIds
     *
     * @return bool
     * @throws \Exception
     */
    public function save(Slack $webhook, array $formIds): bool
    {
        $record       = new WebhookRecord();
        $record->type = Slack::class;

        if ($webhook->getId()) {
            $record = WebhookRecord::findOne(['type' => Slack::class, 'id' => $webhook->getId()]);
        }

        $isNew = (bool) $record->id;

        $record->name     = $webhook->name;
        $record->webhook  = $webhook->webhook;
        $record->settings = $webhook->settings;

        $record->validate();
        $webhook->addErrors($record->getErrors());

        if (empty($formIds)) {
            $webhook->addError('formIds', Freeform::t('Required field'));
        }

        if (empty($webhook->settings['message'] ?? '')) {
            $webhook->addError('message', Freeform::t('Required field'));
        }

        $beforeSaveEvent = new SaveEvent($webhook, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$webhook->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                if ($isNew) {
                    $webhook->id = $record->id;
                }

                if ($transaction !== null) {
                    $transaction->commit();
                }

                $db = \Craft::$app->db;

                $table = '{{%freeform_webhooks_form_relations}}';
                $db->createCommand()
                    ->delete($table, ['webhookId' => $record->id])
                    ->execute();

                foreach ($formIds as $formId) {
                    $db->createCommand()
                        ->insert(
                            $table,
                            ['webhookId' => $record->id, 'formId' => $formId]
                        )
                        ->execute();
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($webhook, $isNew));

                return true;
            } catch (\Exception $e) {
                if ($transaction !== null) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }
}
