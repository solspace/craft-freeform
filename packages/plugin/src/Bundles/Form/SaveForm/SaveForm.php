<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm;

use Carbon\Carbon;
use craft\db\Query;
use craft\helpers\UrlHelper;
use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\SaveForm\Actions\SaveFormAction;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Fields\Pro\SaveField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\SavedFormRecord;
use yii\base\Event;

class SaveForm extends FeatureBundle
{
    public const SAVE_ACTION = 'save';

    public const EVENT_SAVE_FORM = 'save-form';

    public const CLEANUP_CACHE_KEY = 'save-and-continue-cleanup';
    public const CLEANUP_CACHE_TTL = 60 * 60; // 1 hour

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'handleSave']);

        $this->cleanup();
    }

    public static function getPriority(): int
    {
        return 900;
    }

    public static function getEncryptionKey(string $key): string
    {
        return $key.\Craft::$app->getConfig()->getGeneral()->securityKey;
    }

    public function handleSave(HandleRequestEvent $event)
    {
        if ($event->getRequest()->isConsoleRequest) {
            return;
        }

        $isSavingForm = self::SAVE_ACTION === $event->getRequest()->post(Form::ACTION_KEY);
        if (!$isSavingForm) {
            return;
        }

        $form = $event->getForm();
        if (\count($form->getErrors()) || $form->isMarkedAsSpam()) {
            return;
        }

        $isLoaded = SaveFormsHelper::isLoaded($form);
        [$key, $token] = SaveFormsHelper::getTokens($form);

        $record = null;
        if ($isLoaded && $token && $key) {
            $record = SavedFormRecord::findOne(['token' => $token]);
        }

        if (!$record) {
            $token = CryptoHelper::getUniqueToken();
            $key = CryptoHelper::getUniqueToken(25);
        }

        if (!$this->checkEmailField($form)) {
            return;
        }

        $form
            ->getPropertyBag()
            ->remove(SaveFormsHelper::BAG_KEY_SAVED_SESSION)
            ->remove(SaveFormsHelper::BAG_KEY_LOADED)
        ;

        Event::trigger(self::class, self::EVENT_SAVE_FORM, new SaveFormEvent($form));

        $bag = new SessionBag($form->getId(), $form->getPropertyBag()->toArray(), $form->getAttributeBag()->toArray());
        $encryptionKey = $this->getEncryptionKey($key);

        $serialized = json_encode($bag);
        $payload = base64_encode(\Craft::$app->security->encryptByKey($serialized, $encryptionKey));

        \Craft::$app->session->open();
        $sessionId = \Craft::$app->getSession()->getId();

        if (!$record) {
            $record = new SavedFormRecord();
            $record->formId = $form->getId();
            $record->token = $token;
        }

        $record->sessionId = $sessionId;
        $record->payload = $payload;
        $record->save();

        $this->cleanupForSession($sessionId);
        $this->sendNotification($form, $token, $key);
        $this->redirectRequest($event, $form, $token, $key);

        $event->isValid = false;
    }

    /**
     * Checks and validates the email field of the currently posted page
     * If an email field is set up and is required, it has to be filled out or the form won't save
     * If it's not set, or isn't set to be required, the check passes.
     */
    private function checkEmailField(Form $form): bool
    {
        /** @var SaveField[] $saveButtons */
        $saveButtons = $form->getCurrentPage()->getFields(SaveField::class);
        foreach ($saveButtons as $button) {
            /** @var EmailField $emailField */
            $emailField = $form->get($button->getEmailFieldHash());
            if (!$emailField) {
                continue;
            }

            $isRequired = $emailField->isRequired();
            $recipients = array_filter($emailField->getRecipients());

            if ($isRequired && empty($recipients)) {
                return false;
            }
        }

        return true;
    }

    private function sendNotification(Form $form, string $token, string $key)
    {
        $notificationService = Freeform::getInstance()->notifications;
        $mailer = Freeform::getInstance()->mailer;

        /** @var SaveField[] $saveButtons */
        $saveButtons = $form->getCurrentPage()->getFields(SaveField::class);
        foreach ($saveButtons as $button) {
            /** @var EmailField $emailField */
            $emailField = $form->get($button->getEmailFieldHash());
            $notification = $notificationService->getNotificationById($button->getNotificationId());
            if (!$emailField || !$notification) {
                continue;
            }

            $recipients = $mailer->processRecipients($emailField->getRecipients());
            if (empty($recipients)) {
                continue;
            }

            try {
                $message = $mailer->compileMessage($notification, [
                    'dateCreated' => new Carbon(),
                    'form' => $form,
                    'token' => $token,
                    'key' => $key,
                ]);

                $message->setTo($recipients);

                \Craft::$app->mailer->send($message);
            } catch (\Exception $exception) {
                FreeformLogger::getInstance(FreeformLogger::EMAIL_NOTIFICATION)
                    ->warning(
                        $exception->getMessage(),
                        ['form' => $form->getHandle(), 'context' => 'saving form', 'recipients' => $recipients]
                    )
                ;
            }
        }
    }

    private function redirectRequest(HandleRequestEvent $event, Form $form, string $token, string $key)
    {
        $returnUrl = $form->getPropertyBag()->get(SaveFormsHelper::BAG_REDIRECT, '');
        if (empty($returnUrl)) {
            /** @var SaveField[] $saveButtons */
            $saveButtons = $form->getCurrentPage()->getFields(SaveField::class);
            foreach ($saveButtons as $button) {
                $returnUrl = $button->getUrl();
                if (!empty($returnUrl)) {
                    break;
                }
            }

            if (empty($returnUrl)) {
                $currentUrl = \Craft::$app->request->getUrl();
                $returnUrl = UrlHelper::url($currentUrl, ['session-token' => '{token}', 'key' => '{key}']);
            }
        }

        $variables = [
            'form' => $form,
            'token' => $token,
            'key' => $key,
        ];

        $returnUrl = \Craft::$app->view->renderObjectTemplate($returnUrl, $variables, $variables);

        if ($event->getRequest()->getIsAjax()) {
            $form->addAction(
                new SaveFormAction([
                    SaveFormsHelper::PROPERTY_TOKEN => $token,
                    SaveFormsHelper::PROPERTY_KEY => $key,
                    SaveFormsHelper::PROPERTY_URL => $returnUrl,
                ])
            );
        } else {
            \Craft::$app->response->redirect($returnUrl)->send();
        }
    }

    private function cleanupForSession($sessionId)
    {
        if (!$sessionId) {
            return;
        }

        $limit = (int) Freeform::getInstance()->settings->getSettingsModel()->saveFormSessionLimit;
        if ($limit <= 0) {
            return;
        }

        $ids = (new Query())
            ->select(['id'])
            ->from(SavedFormRecord::TABLE)
            ->where(['sessionId' => $sessionId])
            ->orderBy(['dateUpdated' => \SORT_DESC])
            ->column()
        ;

        if ($ids <= $limit) {
            return;
        }

        $deletableIds = \array_slice($ids, $limit);
        if ($deletableIds) {
            \Craft::$app->db->createCommand()
                ->delete(SavedFormRecord::TABLE, ['id' => $deletableIds])
                ->execute()
            ;
        }
    }

    private function cleanup()
    {
        if (Freeform::isLocked(self::CLEANUP_CACHE_KEY, self::CLEANUP_CACHE_TTL)) {
            return;
        }

        if (!\Craft::$app->db->tableExists(SavedFormRecord::TABLE)) {
            return;
        }

        $ttl = (int) Freeform::getInstance()->settings->getSettingsModel()->saveFormTtl;
        if ($ttl <= 0) {
            $ttl = Settings::SAVE_FORM_TTL;
        }

        $expirationTime = new Carbon("now -{$ttl} day", 'UTC');

        \Craft::$app->db->createCommand()
            ->delete(SavedFormRecord::TABLE, ['<', 'dateUpdated', $expirationTime])
            ->execute()
        ;
    }
}
