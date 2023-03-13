<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;

class FieldsService extends BaseService
{
    public function __construct($config = [], private PropertyProvider $propertyProvider)
    {
        parent::__construct($config);
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
            $type = $record->type;

            $metadata = json_decode($record->metadata, true);
            $properties = [
                'id' => $record->id,
                'uid' => $record->uid,
                ...$metadata,
            ];

            $editableProperties = $this->propertyProvider->getEditableProperties($type);
            foreach ($properties as $key => $value) {
                $editableProperty = $editableProperties->get($key);
                if (!$editableProperty || !$editableProperty->transformer instanceof TransformerInterface) {
                    continue;
                }

                $properties[$key] = $editableProperty->transformer->transform($value);
            }

            $fields[] = new $type($form, $properties);
        }

        return $fields;
    }
}
