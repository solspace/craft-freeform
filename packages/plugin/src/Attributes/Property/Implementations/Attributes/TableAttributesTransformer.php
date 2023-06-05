<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Attributes\TableAttributesCollection;

class TableAttributesTransformer implements TransformerInterface
{
    public function transform($value): TableAttributesCollection
    {
        return new TableAttributesCollection($value);
    }

    public function reverseTransform($value): array
    {
        if (!$value instanceof TableAttributesCollection) {
            $value = new TableAttributesCollection();
        }

        return $value->toArray();
    }
}
