<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class TextArea extends Property
{
    public ?string $type = 'textarea';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        public ?int $rows = 2,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width);
    }
}
