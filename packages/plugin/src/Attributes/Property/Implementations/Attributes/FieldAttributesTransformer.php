<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

class FieldAttributesTransformer implements TransformerInterface
{
    public function transform($value): FieldAttributesCollection
    {
        return new FieldAttributesCollection($value);
    }

    public function reverseTransform($value): object
    {
        if ($value instanceof FieldAttributesCollection) {
            return $value->jsonSerialize();
        }

        return (new FieldAttributesCollection())->jsonSerialize();
    }
}
