<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class RecipientMapping extends Property
{
    public ?string $type = 'recipientMapping';
}
