<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\TabularData\TabularDataConfiguration;
use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class TabularData extends Property
{
    public ?string $type = 'tabularData';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        ?array $value = null,
        ?int $width = null,
        public null|array|string|TabularDataConfiguration $configuration = null,
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
