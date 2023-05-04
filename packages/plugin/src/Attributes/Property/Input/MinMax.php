<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class MinMax extends Property
{
    public ?string $type = 'minMax';
}
