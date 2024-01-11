<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Table extends Property implements OptionsInterface
{
    public ?string $type = 'table';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        array $value = null,
        ?int $width = null,
        public null|array|OptionCollection|string $options = null,
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
