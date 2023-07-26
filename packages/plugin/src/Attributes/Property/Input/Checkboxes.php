<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Checkboxes extends Property implements OptionsInterface
{
    public ?string $type = 'checkboxes';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        string|int|null $value = null,
        public ?bool $selectAll = false,
        public ?int $columns = 1,
        public OptionCollection|array|string|null $options = null,
    ) {
        parent::__construct(
            label: $label,
            instructions: $instructions,
            order: $order,
            value: $value,
        );
    }
}
