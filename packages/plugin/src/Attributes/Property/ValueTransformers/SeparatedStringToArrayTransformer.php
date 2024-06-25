<?php

namespace Solspace\Freeform\Attributes\Property\ValueTransformers;

use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Library\Helpers\StringHelper;

class SeparatedStringToArrayTransformer implements TransformerInterface
{
    public function transform($value): array
    {
        if (\is_array($value)) {
            return $value;
        }

        return StringHelper::extractSeparatedValues($value ?? '');
    }

    public function reverseTransform($value): string
    {
        if (\is_array($value)) {
            return implode("\r\n", $value);
        }

        return $value;
    }
}
