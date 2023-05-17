<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\TabularData;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;
use Solspace\Freeform\Fields\Properties\TabularData\TabularData;

class TabularDataTransformer extends Transformer
{
    public function transform($value): TabularData
    {
        return new TabularData($value ?? []);
    }

    /**
     * @param TableLayout $value
     */
    public function reverseTransform($value): array
    {
        $serialized = [];

        if ($value instanceof TabularData) {
            foreach ($value as $row) {
                $serialized[] = $row;
            }
        }

        return $serialized;
    }
}
