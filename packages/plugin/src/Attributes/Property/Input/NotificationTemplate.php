<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string|int|null>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class NotificationTemplate extends Property
{
    public ?string $type = 'notificationTemplate';
}
