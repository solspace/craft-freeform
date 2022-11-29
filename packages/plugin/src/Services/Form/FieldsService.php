<?php

namespace Solspace\Freeform\Services\Form;

use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\Form\FormFieldRecord;
use Solspace\Freeform\Services\BaseService;

class FieldsService extends BaseService
{
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

            $fields[] = new $type($form, $properties);
        }

        return $fields;
    }
}
