<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\OpinionScale;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;
use Solspace\Freeform\Form\Form;

class ScalesTransformer extends Transformer
{
    public function transform($value, ?Form $form = null): array
    {
        $scales = [];
        if (!\is_array($value)) {
            return $scales;
        }

        foreach ($value as $row) {
            if (!\is_array($row)) {
                continue;
            }

            // AI-generated forms previously stored named keys instead of tabular rows.
            $val = $row[0] ?? $row['value'] ?? '';
            $label = $row[1] ?? $row['label'] ?? '';

            $scales[] = new Scale((string) $val, (string) $label);
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
