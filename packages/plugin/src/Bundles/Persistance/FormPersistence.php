<?php

namespace Solspace\Freeform\Bundles\Persistance;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FormPersistence extends FeatureBundle
{
    public function __construct(
        private FormsService $formsService
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

    public function handleFormCreate(PersistFormEvent $event)
    {
        $payload = $event->getPayload()->form;
        $formId = $event->getFormId();

        if (!$formId) {
            $record = FormRecord::create();
            $record->uid = $payload->uid;
        } else {
            $record = FormRecord::findOne(['id' => $formId]);
            if (!$record) {
                throw new FreeformException('Form not found');
            }
        }

        $record->name = $payload->name;
        $record->handle = $payload->handle;
        $record->type = $payload->type;

        $metadata = [];
        $reflection = new \ReflectionClass($payload->type);
        foreach ($reflection->getProperties() as $property) {
            $attribute = $property->getAttributes(EditableProperty::class)[0] ?? null;
            if (!$attribute) {
                continue;
            }

            $metadata[$property->getName()] = $payload->{$property->getName()} ?? $property->getDefaultValue();
        }

        $record->metadata = $metadata;

        $record->validate();
        $record->save();

        if ($record->hasErrors()) {
            $event->addToResponse('form', $record->getErrors());
        }
    }

    public function handleFormUpdate(PersistFormEvent $event)
    {
    }
}
