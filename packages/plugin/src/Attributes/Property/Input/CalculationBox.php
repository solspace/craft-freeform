<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class CalculationBox extends Property
{
    public ?string $type = 'calculationBox';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        ?string $value = null,
        ?int $width = null,
        public ?array $availableFieldTypes = [],
    ) {
        parent::__construct(
            label: $label,
            instructions: $instructions,
            order: $order,
            value: $value,
            width: $width,
        );
    }
}
