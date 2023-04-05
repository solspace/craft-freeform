<?php

namespace Solspace\Freeform\Notifications\Dynamic;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Field\FieldTransformer;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Dynamic Notifications',
    newInstanceName: 'Dynamic',
    icon: __DIR__.'/icon.svg',
)]
class Dynamic extends BaseNotification
{
    #[Property(
        label: 'Target field',
        instructions: 'Select which field should be used to determine where to send the notification.',
        type: Property::TYPE_FIELD,
        order: 9,
        transformer: FieldTransformer::class,
        emptyOption: 'Select a field',
    )]
    protected ?AbstractField $field;
}
