<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FormPersistence extends FeatureBundle
{
    public function __construct(
        private FormsService $formsService,
        private SettingsProvider $settingsProvider,
    ) {
        Event::on(
            FormsController::class,
            FormsController::EVENT_CREATE_FORM,
            [$this, 'handleFormCreate']
        );

        Event::on(
            FormsController::class,
            FormsController::EVENT_UPDATE_FORM,
            [$this, 'handleFormUpdate']
        );
    }

    public static function getPriority(): int
    {
        return 200;
    }

    public function handleFormCreate(PersistFormEvent $event): void
    {
        $payload = $event->getPayload()->form;

        if ($this->plugin()->edition()->is(Freeform::EDITION_EXPRESS)) {
            $totalForms = FormRecord::find()->count();
            if ($totalForms >= 1) {
                $event->addErrorsToResponse(
                    'form',
                    ['name' => [Freeform::t('Freeform Express only allows one form')]]
                );

                return;
            }
        }

        $record = FormRecord::create();
        $record->uid = $payload->uid;
        $record->type = $payload->type;

        $user = \Craft::$app->getUser()->getIdentity();
        $record->createdByUserId = $user->id;

        $this->update($event, $record);
    }

    public function handleFormUpdate(PersistFormEvent $event): void
    {
        $record = FormRecord::findOne(['id' => $event->getFormId()]);

        $this->update($event, $record);
    }

    private function update(PersistFormEvent $event, FormRecord $record): void
    {
        $payload = $event->getPayload()->form;

        $record->name = $payload->settings?->general?->name ?? null;
        $record->handle = $payload?->settings?->general?->handle ?? null;

        $metadata = $this->getValidatedMetadata($payload, $event);
        $record->metadata = $metadata;
        $record->type = $metadata['general']->type ?? Regular::class;

        $user = \Craft::$app->getUser()->getIdentity();
        $record->updatedByUserId = $user->id;

        if (!$event->hasErrors()) {
            $record->validate();
            $record->dateUpdated = new \DateTime();
            $record->save();
        }

        if (!$record->id) {
            $errors = $record->getErrors();
            if (isset($errors['handle'])) {
                $errors['name'] = $errors['handle'];
                unset($errors['handle']);
            }
            $event->addErrorsToResponse('form', $errors);

            return;
        }

        $form = $this->formsService->getFormById($record->id);
        $event->setForm($form);
        $event->addToResponse('form', $form);
    }

    private function getValidatedMetadata(\stdClass $payload, PersistFormEvent $event): array
    {
        $postedSettings = $payload->settings;
        $namespaces = $this->settingsProvider->getSettingNamespaces();

        $metadata = [];
        foreach ($namespaces as $namespace) {
            $posted = $postedSettings->{$namespace->handle} ?? new \stdClass();

            $properties = [];
            foreach ($namespace->properties as $property) {
                $handle = $property->handle;
                $value = $posted->{$handle} ?? $property->value;

                $errors = [];

                foreach ($property->validators as $validator) {
                    $errors = array_merge($errors, $validator->validate($value));
                }

                if ($errors) {
                    $event->addErrorsToResponse(
                        'form',
                        [$namespace->handle => [$handle => $errors]]
                    );
                }

                $properties[$handle] = $value;
            }

            $metadata[$namespace->handle] = (object) $properties;
        }

        return $metadata;
    }
}
