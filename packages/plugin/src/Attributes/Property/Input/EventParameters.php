<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class EventParameters extends Property
{
    public ?string $type = 'eventParameters';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        public array $availableFieldTypes = [],
    ) {
        parent::__construct(label: $label, instructions: $instructions);
    }
}
