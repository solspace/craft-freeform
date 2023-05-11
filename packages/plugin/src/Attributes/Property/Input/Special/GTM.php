<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class GTM extends Property
{
    public ?string $type = 'gtm';
}
