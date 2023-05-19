<?php

namespace Solspace\Freeform\Notifications\Types\EmailField;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Email Field Notifications',
    newInstanceName: 'Email Field',
    icon: __DIR__.'/icon.svg',
)]
class EmailField extends BaseNotification
{
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Target field',
        instructions: 'Select which field should be used to send the notification to.',
        order: 9,
        emptyOption: 'Select a field',
        implements: [RecipientInterface::class],
    )]
    protected ?FieldInterface $field;

    #[ValueTransformer(NotificationTemplateTransformer::class)]
    #[VisibilityFilter('Boolean(field)')]
    #[Input\NotificationTemplate(
        label: 'Notification Template',
        instructions: 'Select a notification template to use for this notification.',
        order: 9,
    )]
    protected ?NotificationTemplate $template;

    public function getField(): ?FieldInterface
    {
        return $this->field;
    }

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }
}
