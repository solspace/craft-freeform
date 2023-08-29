<?php

namespace Solspace\Freeform\Notifications\Types\Dynamic;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients\RecipientMappingTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients\RecipientTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\BooleanInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\BaseNotification;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientMappingCollection;

#[Type(
    name: 'User Select',
    newInstanceName: 'User Select',
    order: 3,
    icon: __DIR__.'/../Icons/user-select.svg',
)]
class Dynamic extends BaseNotification
{
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Target field',
        instructions: 'Select which field should be used to determine where to send the notification.',
        order: 3,
        emptyOption: 'Select a field',
        implements: [
            OptionsInterface::class,
            BooleanInterface::class,
        ],
    )]
    protected ?FieldInterface $field;

    #[ValueTransformer(NotificationTemplateTransformer::class)]
    #[Input\NotificationTemplate(
        label: 'Default Notification Template',
        instructions: 'This notification template will be used as a default notification template for all values unless specified otherwise.',
        order: 4,
    )]
    protected ?NotificationTemplate $template;

    #[ValueTransformer(RecipientTransformer::class)]
    #[Input\Recipients(
        label: 'Default Recipients',
        instructions: 'Specify recipients that should receive notifications if not specifically configured below.',
        order: 5,
        value: [],
    )]
    protected RecipientCollection $recipients;

    #[ValueTransformer(RecipientMappingTransformer::class)]
    #[Input\RecipientMapping(
        label: 'Recipient Mapping',
        instructions: 'Specify recipients that should receive notifications based on the value of the target field.',
        order: 6,
    )]
    protected ?RecipientMappingCollection $recipientMapping;

    public function getField(): ?FieldInterface
    {
        return $this->field;
    }

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }

    public function getRecipients(): RecipientCollection
    {
        return $this->recipients;
    }

    public function getRecipientMapping(): ?RecipientMappingCollection
    {
        return $this->recipientMapping;
    }

    public function getTemplateFromValue(mixed $value): ?NotificationTemplate
    {
        $default = $this->getTemplate();
        $mapping = $this->recipientMapping->getMappingByValue($value);
        if (!$mapping) {
            return $default;
        }

        return $mapping->getTemplate();
    }

    public function getRecipientsFromValue(mixed $value): RecipientCollection
    {
        $default = $this->getRecipients();
        $mapping = $this->recipientMapping->getMappingByValue($value);
        if (!$mapping) {
            return $default;
        }

        return $mapping->getRecipients();
    }
}
