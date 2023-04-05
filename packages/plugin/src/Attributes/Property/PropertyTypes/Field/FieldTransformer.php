<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes\Field;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Fields\AbstractField;

class FieldTransformer implements TransformerInterface
{
    public function __construct(private FieldProvider $fieldProvider)
    {
    }

    public function transform($value): ?AbstractField
    {
        return $this->fieldProvider->getFieldByUid($value);
    }

    public function reverseTransform($value): ?string
    {
        if ($value instanceof AbstractField) {
            return $value->getUid();
        }

        return null;
    }
}
