<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Field;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Bundles\Fields\FieldProvider;
use Solspace\Freeform\Fields\FieldInterface;

class FieldTransformer implements TransformerInterface
{
    public function __construct(private FieldProvider $fieldProvider)
    {
    }

    public function transform($value): ?FieldInterface
    {
        return $this->fieldProvider->getFieldByUid($value);
    }

    public function reverseTransform($value): ?string
    {
        if ($value instanceof FieldInterface) {
            return $value->getUid();
        }

        return null;
    }
}
