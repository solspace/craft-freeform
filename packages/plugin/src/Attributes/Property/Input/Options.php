<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Options extends Property implements OptionsInterface
{
    public ?string $type = 'options';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        public ?string $emptyOption = null,
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
