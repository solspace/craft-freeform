<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special\Properties;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class FieldMapping extends Property
{
    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        public ?string $source = null,
        public ?array $parameterFields = null,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width);
    }
}
