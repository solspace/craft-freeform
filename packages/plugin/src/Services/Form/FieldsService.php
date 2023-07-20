<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;
use Solspace\Freeform\Services\FormsService;

class FieldsService extends BaseService
{
    private static array $fieldCache = [];

    public function __construct(
        $config = [],
        private PropertyProvider $propertyProvider,
        private FormsService $formsService,
    ) {
        parent::__construct($config);
    }

    public function getFieldByUid(string $fieldUid): ?FieldInterface
    {
        $record = FormFieldRecord::findOne(['uid' => $fieldUid]);
        if ($record) {
            $form = $this->formsService->getFormById($record->formId);

            return $this->createField($record, $form);
        }

        return null;
    }

    public function getFieldByFormAndUid(Form $form, string $fieldUid): ?FieldInterface
    {
        $records = $this->getAllFieldRecords($form);

        foreach ($records as $record) {
            if ($record->uid === $fieldUid) {
                return $this->createField($record, $form);
            }
        }

        return null;
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
                $field = $this->createField($record, $forms[$record->formId]);
                if ($field) {
                    $fields[] = $field;
                }
            }
        }

        return $fields;
    }

    public function getFields(Form $form): array
    {
        $fields = [];
        foreach ($this->getAllFieldRecords($form) as $record) {
            $field = $this->createField($record, $form);
            if ($field) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    public function createField(FormFieldRecord $record, Form $form): ?FieldInterface
    {
        $type = $record->type;

        $metadata = json_decode($record->metadata, true);
        $properties = [
            'id' => $record->id,
            'uid' => $record->uid,
            ...$metadata,
        ];

        if (!class_exists($type)) {
            return null;
        }

        $field = new $type($form);
        $this->propertyProvider->setObjectProperties($field, $properties);

        return $field;
    }

    /**
     * @return array|FormFieldRecord[]
     */
    private function getAllFieldRecords(Form $form): array
    {
        static $records;

        if (null === $records) {
            $records = FormFieldRecord::find()
                ->where(['formId' => $form->getId()])
                ->all()
            ;
        }

        return $records;
    }
}
