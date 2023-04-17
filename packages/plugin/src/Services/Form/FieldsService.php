<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;
use Solspace\Freeform\Services\FormsService;

class FieldsService extends BaseService
{
    public function __construct(
        $config = [],
        private PropertyProvider $propertyProvider,
        private FormsService $formsService,
    ) {
        parent::__construct($config);
    }

    public function getAllFields(): array
    {
        static $fields;

        if (null === $fields) {
            $forms = $this->formsService->getAllForms();

            /** @var FormFieldRecord[] $records */
            $records = FormFieldRecord::find()->all();

            $fields = [];
            foreach ($records as $record) {
                $type = $record->type;

                $metadata = json_decode($record->metadata, true);
                $properties = [
                    'id' => $record->id,
                    'uid' => $record->uid,
                    ...$metadata,
                ];

                $form = $forms[$record->formId];

                $field = new $type($form);
                $this->propertyProvider->setObjectProperties($field, $properties);

                $fields[] = $field;
            }
        }

        return $fields;
    }

    public function getFields(Form $form): array
    {
        /** @var FormFieldRecord[] $records */
        $records = FormFieldRecord::find()
            ->where(['formId' => $form->getId()])
            ->all()
        ;

        $fields = [];
        foreach ($records as $record) {
            $field = $this->createField($record, $form);

            $fields[] = $field;
        }

        return $fields;
    }

    public function createField(FormFieldRecord $record, Form $form): mixed
    {
        $type = $record->type;

        $metadata = json_decode($record->metadata, true);
        $properties = [
            'id' => $record->id,
            'uid' => $record->uid,
            ...$metadata,
        ];

        $field = new $type($form);
        $this->propertyProvider->setObjectProperties($field, $properties);

        return $field;
    }
}
