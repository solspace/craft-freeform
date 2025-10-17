<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Attributes;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Form\Form;

class ArrayOfNumbersTransformer implements TransformerInterface
{
    public function transform($value, ?Form $form = null): array
    {
        if (empty($value)) {
            return [];
        }

        if (\is_string($value)) {
            $value = explode(',', $value);
        }

        $value = array_map('trim', $value);
        $value = array_map('intval', $value);

        return array_filter($value);
    }

    public function reverseTransform($value): string
    {
        if (\is_array($value)) {
            return implode(', ', $value);
        }

        return $value;
    }
}
