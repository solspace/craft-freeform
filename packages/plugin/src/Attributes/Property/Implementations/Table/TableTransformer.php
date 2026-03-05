<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Table;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\Table\TableLayout;
use Solspace\Freeform\Form\Form;

class TableTransformer extends Transformer
{
    public function transform($value, ?Form $form = null): TableLayout
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
                'placeholder' => $column->placeholder,
                'options' => $column->options,
                'checked' => $column->checked,
                'required' => $column->required,
                'metadata' => $column->metadata,
            ];
        }

        return $serialized;
    }
}
