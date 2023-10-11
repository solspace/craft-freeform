<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Attributes extends Property
{
    public ?string $type = 'attributes';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        ?bool $disabled = null,
        public ?array $tabs = null,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width, $disabled);
    }
}
