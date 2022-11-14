<?php

namespace Solspace\Freeform\Bundles\Persistance;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FormPersistence extends FeatureBundle
{
    public function __construct(
        private FormsService $formsService,
        private AttributeProvider $attributeProvider,
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

    public function handleFormCreate(PersistFormEvent $event)
    {
        $payload = $event->getPayload()->form;

        $record = FormRecord::create();
        $record->uid = $payload->uid;
        $record->type = $payload->type;

        $record->metadata = $this->getMetadata($payload);

        $this->update($event, $record);
    }

    public function handleFormUpdate(PersistFormEvent $event)
    {
        $record = FormRecord::findOne(['id' => $event->getFormId()]);

        $this->update($event, $record);
    }

    private function update(PersistFormEvent $event, FormRecord $record)
    {
        $payload = $event->getPayload()->form;

        $record->name = $payload->properties->name;
        $record->handle = $payload->properties->handle;

        $record->metadata = $this->getMetadata($payload);

        $record->validate();
        $record->save();

        if ($record->hasErrors()) {
            $event->addErrorsToResponse('form', $record->getErrors());

            return;
        }

        $form = $this->formsService->getFormById($record->id);
        $event->setForm($form);
        $event->addToResponse('form', $form);
    }

    private function getMetadata(\stdClass $payload): array
    {
        $properties = $this->attributeProvider->getEditableProperties($payload->type);

        $metadata = [];

        /** @var Property $property */
        foreach ($properties as $property) {
            $handle = $property->handle;
            // TODO: implement value transformer calls here
            $metadata[$handle] = $payload->properties->{$handle} ?? null;
        }

        return $metadata;
    }
}
