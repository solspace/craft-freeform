<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\OpinionScale;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\OpinionScale\Legend;
use Solspace\Freeform\Form\Form;

class LegendsTransformer extends Transformer
{
    public function transform($value, ?Form $form = null): array
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

        // @var Legend $legend
        foreach ($value as $legend) {
            $data[] = [(string) $legend];
        }

        return $data;
    }
}
