<?php

namespace Solspace\Freeform\Notifications\Types\Dynamic;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Notifications\Recipients\RecipientMappingTransformer;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\BaseNotification;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMappingCollection;

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

    #[Property(
        label: 'Default Notification Template',
        instructions: 'This notification template will be used as a default notification template for all values unless specified otherwise.',
        type: Property::TYPE_NOTIFICATION_TEMPLATE,
        order: 10,
        transformer: NotificationTemplateTransformer::class,
    )]
    protected ?NotificationTemplate $template;

    #[Property(
        label: 'Recipient Mapping',
        instructions: 'Specify recipients that should receive notifications based on the value of the target field.',
        type: Property::TYPE_RECIPIENT_MAPPING,
        order: 11,
        transformer: RecipientMappingTransformer::class,
    )]
    protected ?RecipientMappingCollection $recipientMapping;

    public function getField(): ?AbstractField
    {
        return $this->field;
    }

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }

    public function getRecipientMapping(): ?RecipientMappingCollection
    {
        return $this->recipientMapping;
    }
}
