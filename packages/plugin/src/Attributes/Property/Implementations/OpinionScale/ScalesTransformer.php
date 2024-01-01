<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\OpinionScale;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;

class ScalesTransformer extends Transformer
{
    public function transform($value): array
    {
        $scales = [];
        if (!\is_array($value)) {
            return $scales;
        }

        foreach ($value as [$val, $label]) {
            $scales[] = new Scale($val, $label);
        }

        return $scales;
    }

    public function reverseTransform($value): array
    {
        $data = [];
        if (!\is_array($value)) {
            return $data;
        }

        /** @var Scale $scale */
        foreach ($value as $scale) {
            $data[] = [$scale->getValue(), $scale->getLabel()];
        }

        return $data;
    }
}
