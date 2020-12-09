<?php

namespace Solspace\Freeform\Services\Pro;

use craft\db\Query;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\Events\Integrations\FetchWebhookTypesEvent;
use Solspace\Freeform\Events\Webhooks\SaveEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;
use Solspace\Freeform\Library\Webhooks\WebhookInterface;
use Solspace\Freeform\Models\Pro\WebhookModel;
use Solspace\Freeform\Records\Pro\WebhookRecord;
use Solspace\Freeform\Services\BaseService;

class WebhooksService extends BaseService
{
    const EVENT_BEFORE_SAVE = 'beforeSave';
    const EVENT_AFTER_SAVE = 'afterSave';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE = 'afterDelete';
    const EVENT_FETCH_TYPES = 'fetchTypes';

    /** @var array */
    private static $providers;

    public function triggerWebhooks(AfterSubmitEvent $event)
    {
        $form = $event->getForm();
        if ($form->getSuppressors()->isWebhooks()) {
            return;
        }

        $webhooks = $this->getWebhooksForForm($form);
        foreach ($webhooks as $webhook) {
            $webhook->triggerWebhook($event);
        }
    }

    /**
     * @return array|WebhookInterface[]
     */
    public function getAll(): array
    {
        return $this->getAllWebhookModels($this->getQuery());
    }

    /**
     * @param string $id
     *
     * @return null|WebhookModel
     */
    public function getById($id)
    {
        return $this->getWebhookModel($this->getQuery()->where(['id' => $id]));
    }

    public function getSelectedFormsFor(WebhookModel $webhook): array
    {
        return (new Query())
            ->select('formId')
            ->from(WebhookRecord::RELATION_TABLE)
            ->where(['webhookId' => $webhook->id])
            ->column()
        ;
    }

    public function getWebhooksFor(array $formIds): array
    {
        $query = $this->getQuery()
            ->innerJoin(WebhookRecord::RELATION_TABLE.' rt', '[[rt.webhookId]] = [[w.id]]')
            ->where(['IN', '[[rt.formId]]', $formIds])
        ;

        return $this->getAllWebhooks($query);
    }

    /**
     * @param int $id
     *
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function deleteById($id): bool
    {
        $record = WebhookRecord::findOne(['id' => $id]);
        if ($record) {
            $record->delete();

            return true;
        }

        return false;
    }

    /**
     * Alias for ::deleteById().
     *
     * @param int $id
     *
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete($id): bool
    {
        return $this->deleteById($id);
    }

    /**
     * @throws \Exception
     */
    public function save(WebhookModel $webhook, array $formIds): bool
    {
        $record = new WebhookRecord();

        if ($webhook->id) {
            $record = WebhookRecord::findOne(['id' => $webhook->id]);
        }

        $isNew = (bool) $record->id;

        $record->type = $webhook->type;
        $record->name = $webhook->name;
        $record->webhook = $webhook->webhook;
        $record->settings = $webhook->settings;

        $record->validate();
        $webhook->addErrors($record->getErrors());

        $beforeSaveEvent = new SaveEvent($webhook, $isNew);
        $this->trigger(self::EVENT_BEFORE_SAVE, $beforeSaveEvent);

        if ($beforeSaveEvent->isValid && !$webhook->hasErrors()) {
            $transaction = \Craft::$app->getDb()->beginTransaction();

            try {
                $record->save(false);

                if ($isNew) {
                    $webhook->id = $record->id;
                }

                if (null !== $transaction) {
                    $transaction->commit();
                }

                $db = \Craft::$app->db;

                $table = '{{%freeform_webhooks_form_relations}}';
                $db->createCommand()
                    ->delete($table, ['webhookId' => $record->id])
                    ->execute()
                ;

                foreach ($formIds as $formId) {
                    $db->createCommand()
                        ->insert(
                            $table,
                            ['webhookId' => $record->id, 'formId' => $formId]
                        )
                        ->execute()
                    ;
                }

                $this->trigger(self::EVENT_AFTER_SAVE, new SaveEvent($webhook, $isNew));

                return true;
            } catch (\Exception $e) {
                if (null !== $transaction) {
                    $transaction->rollBack();
                }

                throw $e;
            }
        }

        return false;
    }

    public function getAllWebhookProviders(): array
    {
        if (null === self::$providers) {
            $event = new FetchWebhookTypesEvent();
            $this->trigger(self::EVENT_FETCH_TYPES, $event);

            self::$providers = $event->getTypes();
        }

        return self::$providers;
    }

    /**
     * @return WebhookInterface[]
     */
    private function getWebhooksForForm(Form $form): array
    {
        return $this->getWebhooksFor([$form->getId()]);
    }

    private function getQuery(): Query
    {
        return (new Query())
            ->select(['[[w.id]]', '[[w.type]]', '[[w.name]]', '[[w.webhook]]', '[[w.settings]]'])
            ->from(WebhookRecord::TABLE.'w')
        ;
    }

    /**
     * @return null|WebhookModel
     */
    private function getWebhookModel(Query $query)
    {
        $result = $query->one();
        if ($result) {
            return $this->buildWebhookModel($result);
        }

        return null;
    }

    /**
     * @return array|WebhookModel[]
     */
    private function getAllWebhookModels(Query $query): array
    {
        $webhooks = [];

        $results = $query->all();
        foreach ($results as $result) {
            $model = $this->buildWebhookModel($result);
            if ($model && class_exists($model->type)) {
                $webhooks[] = $model;
            }
        }

        return $webhooks;
    }

    /**
     * @return array|WebhookInterface[]
     */
    private function getAllWebhooks(Query $query): array
    {
        $webhooks = [];

        foreach ($this->getAllWebhookModels($query) as $model) {
            $webhooks[] = $this->buildWebhook($model);
        }

        return $webhooks;
    }

    private function buildWebhook(WebhookModel $model): AbstractWebhook
    {
        return new $model->type(\Craft::parseEnv($model->getWebhook()), $model->getSettings());
    }

    /**
     * @return null|WebhookModel
     */
    private function buildWebhookModel(array $data)
    {
        $id = $data['id'] ?? null;
        $type = $data['type'] ?? null;
        $name = $data['name'] ?? null;
        $webhook = $data['webhook'] ?? null;
        $settings = $data['settings'] ?? [];

        if (\is_string($settings)) {
            $settings = \GuzzleHttp\json_decode($settings, true);
        }

        if (!$id || !$type || !class_exists($type)) {
            return null;
        }

        $model = new WebhookModel();
        $model->id = $id;
        $model->type = $type;
        $model->name = $name;
        $model->webhook = $webhook;
        $model->settings = $settings;

        return $model;
    }
}
