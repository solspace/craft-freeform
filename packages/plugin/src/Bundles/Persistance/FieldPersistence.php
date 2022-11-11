<?php

namespace Solspace\Freeform\Bundles\Persistance;

use craft\db\Query;
use Solspace\Freeform\Bundles\Fields\AttributeProvider;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use yii\base\Event;

class FieldPersistence extends FeatureBundle
{
    public function __construct(
        private AttributeProvider $attributeProvider,
    ) {
        Event::on(
            FormsController::class,
            FormsController::EVENT_UPSERT_FORM,
            [$this, 'handleFieldSave']
        );
    }

    public static function getPriority(): int
    {
        return 300;
    }

    public function handleFieldSave(PersistFormEvent $event)
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $usedUIDs = [];
        $existingUIDs = (new Query())
            ->select(['uid'])
            ->from(FormFieldRecord::TABLE)
            ->where(['formId' => $form->getId()])
            ->column()
        ;

        $payload = $event->getPayload()->fields;

        $records = [];

        foreach ($payload as $fieldData) {
            $type = $fieldData->typeClass ?? null;
            if (!$type) {
                continue;
            }

            $record = FormFieldRecord::findOne(['uid' => $fieldData->uid]);
            if (!$record) {
                $record = new FormFieldRecord();
                $record->formId = $form->getId();
                $record->uid = $fieldData->uid;
                $record->type = $fieldData->typeClass;
            }

            $record->metadata = $this->getMetadata($fieldData);

            $records[] = $record;
            $usedUIDs[] = $record->uid;
        }

        $errors = [];
        foreach ($records as $record) {
            $record->validate();
            if ($record->hasErrors()) {
                $errors[$record->uid] = $record->getErrors();
            }
        }

        if ($errors) {
            $event->addErrorsToResponse('fields', $errors);

            return;
        }

        $deletableUIDs = array_diff($existingUIDs, $usedUIDs);
        if ($deletableUIDs) {
            \Craft::$app
                ->db
                ->createCommand()
                ->delete(FormFieldRecord::TABLE, ['uid' => $deletableUIDs])
                ->execute()
            ;
        }

        foreach ($records as $record) {
            $record->save();
        }
    }

    private function getMetadata(\stdClass $fieldData): array
    {
        $properties = $this->attributeProvider->getEditableProperties($fieldData->typeClass);

        $metadata = [];

        /** @var Property $property */
        foreach ($properties as $property) {
            $handle = $property->handle;
            // TODO: implement value transformer calls here
            $metadata[$handle] = $fieldData->properties->{$handle} ?? null;
        }

        return $metadata;
    }
}
