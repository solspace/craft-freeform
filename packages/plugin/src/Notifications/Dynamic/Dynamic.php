<?php

namespace Solspace\Freeform\Notifications\Dynamic;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Dynamic Notifications',
    newInstanceName: 'Dynamic',
    icon: __DIR__.'/icon.svg',
)]
class Dynamic extends BaseNotification
{
    #[Validators\Required]
    #[Input\Field(
        label: 'Target field',
        instructions: 'Select which field should be used to determine where to send the notification.',
    )]
    protected FieldInterface $field;
}
