<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Field extends Property
{
    public ?string $type = 'field';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        ?string $value = null,
        public ?string $emptyOption = null,
        public ?array $implements = [],
    ) {
        parent::__construct(
            label: $label,
            instructions: $instructions,
            order: $order,
            value: $value,
        );
    }
}
