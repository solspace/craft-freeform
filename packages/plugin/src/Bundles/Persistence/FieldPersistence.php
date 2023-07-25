<?php

namespace Solspace\Freeform\Bundles\Persistence;

use craft\db\Query;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use yii\base\Event;

class FieldPersistence extends FeatureBundle
{
    public function __construct(
        private PropertyProvider $propertyProvider,
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

    public function handleFieldSave(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $payload = $event->getPayload()->fields ?? null;
        if (null === $payload) {
            return;
        }

        $usedUIDs = [];
        $existingUIDs = (new Query())
            ->select(['uid'])
            ->from(FormFieldRecord::TABLE)
            ->where(['formId' => $form->getId()])
            ->column()
        ;

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
            }

            $record->type = $fieldData->typeClass;
            $record->metadata = $this->getValidatedMetadata($fieldData, $event);

            $records[] = $record;
            $usedUIDs[] = $record->uid;
        }

        $deletableUIDs = array_diff($existingUIDs, $usedUIDs);
        if ($deletableUIDs) {
            \Craft::$app
                ->db
                ->createCommand()
                ->delete(FormFieldRecord::TABLE, ['uid' => $deletableUIDs])
                ->execute();
        }

        if ($event->hasErrors()) {
            return;
        }

        foreach ($records as $record) {
            $record->save();
            $event->addFieldRecord($record);
        }
    }

    private function getValidatedMetadata(\stdClass $fieldData, PersistFormEvent $event): array
    {
        $properties = $this->propertyProvider->getEditableProperties($fieldData->typeClass);

        $metadata = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $value = $fieldData->properties->{$handle} ?? null;

            $errors = [];
            foreach ($property->validators as $validator) {
                $errors = array_merge($errors, $validator->validate($value));
            }

            if ($errors) {
                $event->addErrorsToResponse(
                    'fields',
                    [$fieldData->uid => [$property->handle => $errors]]
                );
            }

            $metadata[$handle] = $value;
        }

        return $metadata;
    }
}
