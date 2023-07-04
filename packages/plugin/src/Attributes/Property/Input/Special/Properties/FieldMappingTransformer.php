<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special\Properties;

use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\TransformerInterface;

class FieldMappingTransformer implements TransformerInterface
{
    public function transform($value): FieldMapping
    {
        return new FieldMapping();
    }

    public function reverseTransform($value): array
    {
        if ($value instanceof FieldMapping) {
            return [];
        }

        return [];
    }
}
