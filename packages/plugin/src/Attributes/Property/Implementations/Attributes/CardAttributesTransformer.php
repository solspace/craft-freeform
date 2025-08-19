<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\CardAttributesCollection;

class CardAttributesTransformer implements TransformerInterface
{
    public function transform($value, ?Form $form = null): CardAttributesCollection
    {
        return new CardAttributesCollection($value);
    }

    public function reverseTransform($value): object
    {
        if ($value instanceof CardAttributesCollection) {
            return $value->jsonSerialize();
        }

        return (new CardAttributesCollection())->jsonSerialize();
    }
}
