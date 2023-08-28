<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\OpinionScale;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\OpinionScale\Legend;

class LegendsTransformer extends Transformer
{
    public function transform($value): mixed
    {
        $legends = [];
        if (!\is_array($value)) {
            return $legends;
        }

        foreach ($value as [$label]) {
            $legends[] = new Legend($label);
        }

        return $legends;
    }

    public function reverseTransform($value): array
    {
        $data = [];
        if (!\is_array($value)) {
            return $data;
        }

        // @var Legend $leged
        foreach ($value as $legend) {
            $data[] = [(string) $legend];
        }

        return $data;
    }
}
