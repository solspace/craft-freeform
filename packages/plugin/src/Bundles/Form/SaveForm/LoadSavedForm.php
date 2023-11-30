<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm;

use Solspace\Freeform\Bundles\Form\SaveForm\Events\LoadFormEvent;
use Solspace\Freeform\Events\Forms\RegisterContextEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\SavedFormRecord;
use yii\base\Event;

class LoadSavedForm extends FeatureBundle
{
    public const EVENT_FORM_LOADED = 'form-loaded';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'loadSavedForm']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'handleFinalizeForm']);
    }

    public static function getPriority(): int
    {
        return 900;
    }

    public function loadSavedForm(RegisterContextEvent $event): void
    {
        $form = $event->getForm();

        if (SaveFormsHelper::isLoaded($form)) {
            return;
        }

        [$key, $token] = SaveFormsHelper::getTokens($form);
        if (!$key || !$token) {
            return;
        }

        $record = SavedFormRecord::findOne(['formId' => $form->getId(), 'token' => $token]);
        if (!$record) {
            return;
        }

        $encryptionKey = SaveForm::getEncryptionKey($key);

        $payload = $record->payload;
        $decrypted = \Craft::$app->security->decryptByKey(base64_decode($payload), $encryptionKey);

        $json = json_decode($decrypted, true);
        $properties = $json['properties'] ?? [];
        $attributes = $json['attributes'] ?? [];

        $properties[SaveFormsHelper::BAG_KEY_LOADED] = true;

        $form->getAttributes()->merge($attributes);
        $form->getProperties()->merge($properties);

        Event::trigger(self::class, self::EVENT_FORM_LOADED, new LoadFormEvent($form));
    }

    public function handleFinalizeForm(SubmitEvent $event): void
    {
        $form = $event->getForm();

        [$key, $token] = SaveFormsHelper::getTokens($form);
        if (!$key || !$token) {
            return;
        }

        $record = SavedFormRecord::findOne(['formId' => $form->getId(), 'token' => $token]);
        if (!$record) {
            return;
        }

        $record->delete();
        $form->getProperties()->remove(SaveFormsHelper::BAG_KEY_SAVED_SESSION);
    }
}
