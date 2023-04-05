<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Services\Form\FieldsService;

class FieldProvider
{
    public function __construct(private FieldsService $service)
    {
    }

    public function getFieldByUid(?string $uid): ?AbstractField
    {
        if (null === $uid) {
            return null;
        }

        $fields = $this->service->getAllFields();

        foreach ($fields as $field) {
            if ($field->getUid() === $uid) {
                return $field;
            }
        }
    }
}
