<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Form\Layout\Page\Buttons\ButtonAttributesCollection;

class PageButtonAttributesTransformer implements TransformerInterface
{
    public function transform($value): ButtonAttributesCollection
    {
        return new ButtonAttributesCollection($value);
    }

    public function reverseTransform($value): object
    {
        if ($value instanceof ButtonAttributesCollection) {
            return $value->jsonSerialize();
        }

        return (new ButtonAttributesCollection())->jsonSerialize();
    }
}
