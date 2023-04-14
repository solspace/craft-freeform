<?php

namespace Solspace\Freeform\Notifications\Dynamic;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Dynamic Notifications',
    icon: __DIR__.'/icon.svg',
)]
class Dynamic extends BaseNotification
{
    #[Property(
        label: 'Target field',
        instructions: 'Select which field should be used to determine where to send the notification.',
        required: true,
    )]
    protected AbstractField $field;
}
