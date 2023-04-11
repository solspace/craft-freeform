<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes\Table;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;

class TableTransformer extends Transformer
{
    public function transform($value): TableLayout
    {
        return new TableLayout($value ?? []);
    }

    /**
     * @param TableLayout $value
     */
    public function reverseTransform($value): array
    {
        $serialized = [];

        foreach ($value as $column) {
            $serialized[] = [
                'label' => $column->label,
                'value' => $column->value,
                'type' => $column->type,
            ];
        }

        return $serialized;
    }
}
