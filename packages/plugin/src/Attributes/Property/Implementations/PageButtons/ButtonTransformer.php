<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\PageButtons;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Form\Layout\Page\Buttons\Button;

class ButtonTransformer extends Transformer
{
    public function transform($value): Button
    {
        return new Button($value);
    }

    public function reverseTransform($value): array
    {
        if ($value instanceof Button) {
            return [
                'label' => $value->getLabel(),
                'enabled' => $value->getEnabled(),
            ];
        }

        return [
            'label' => '',
            'enabled' => false,
        ];
    }
}
