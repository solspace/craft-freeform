<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class DynamicCheckboxes extends Property
{
    public ?string $type = 'dynamicCheckboxes';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        null|int|string $value = null,
        ?int $width = null,
        public ?string $source = null,
        public ?array $parameterFields = null,
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
