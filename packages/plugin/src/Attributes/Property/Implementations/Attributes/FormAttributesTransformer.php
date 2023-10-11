<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;

class FormAttributesTransformer implements TransformerInterface
{
    public function transform($value): FormAttributesCollection
    {
        return new FormAttributesCollection($value);
    }

    public function reverseTransform($value): object
    {
        if ($value instanceof FormAttributesCollection) {
            return $value->jsonSerialize();
        }

        return (new FormAttributesCollection())->jsonSerialize();
    }
}
