<?php

namespace Solspace\Freeform\Bundles\Persistence;

use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
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

        $record = FormRecord::create();
        $record->uid = $payload->uid;
        $record->type = $payload->type;

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

        $record->metadata = $this->getValidatedMetadata($payload, $event);

        if (!$event->hasErrors()) {
            $record->validate();
            $record->save();
        }

        if (!$record->id) {
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
