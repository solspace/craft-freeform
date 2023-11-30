<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class ApplicationStateSelect extends Property
{
    public ?string $type = 'appStateSelect';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        string|int|null $value = null,
        ?int $width = null,
        public ?string $emptyOption = null,
        public ?string $source = null,
        public ?string $optionValue = null,
        public ?string $optionLabel = null,
        public ?array $filters = null,
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
