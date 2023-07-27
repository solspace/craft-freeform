<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Layout;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Form\Layout\Layout;

class GroupFieldLayoutTransformer extends Transformer
{
    public function transform($value): Layout
    {
        return new Layout($value);
    }

    public function reverseTransform($value): ?string
    {
        if ($value instanceof Layout) {
            return $value->getUid();
        }

        return null;
    }
}
