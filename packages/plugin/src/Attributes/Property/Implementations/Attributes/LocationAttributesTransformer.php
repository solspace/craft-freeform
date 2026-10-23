<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\LocationAttributesCollection;

class LocationAttributesTransformer implements TransformerInterface
{
    public function transform($value, ?Form $form = null): LocationAttributesCollection
    {
        return new LocationAttributesCollection($value ?? []);
    }

    public function reverseTransform($value): array
    {
        return ($value instanceof LocationAttributesCollection ? $value : new LocationAttributesCollection())->toArray();
    }
}
