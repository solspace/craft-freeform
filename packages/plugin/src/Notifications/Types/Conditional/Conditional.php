<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Notifications\Types\Conditional;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\NotificationTemplates\NotificationTemplateTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Notifications\Recipients\RecipientTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Rules\Rule;
use Solspace\Freeform\Notifications\BaseNotification;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;

#[Type(
    name: 'Conditional Notifications',
    newInstanceName: 'Conditional',
    icon: __DIR__.'/icon.svg',
)]
class Conditional extends BaseNotification
{
    #[ValueTransformer(NotificationTemplateTransformer::class)]
    #[Input\NotificationTemplate(
        label: 'Notification Template',
        instructions: 'Select a notification template to use for this notification.',
        order: 9,
    )]
    protected ?NotificationTemplate $template;

    #[ValueTransformer(RecipientTransformer::class)]
    #[Input\Recipients(
        instructions: 'List the recipients of this notification.',
        order: 10,
        value: [],
    )]
    protected RecipientCollection $recipients;

    #[ValueTransformer(NotificationRuleTransformer::class)]
    #[Input\Special\ConditionalNotificationRule(
        label: 'Notification Rule',
        instructions: 'Select a rule to use for this notification.',
        order: 11,
    )]
    protected ?Rule $rule;

    public function getTemplate(): ?NotificationTemplate
    {
        return $this->template;
    }

    public function getRecipients(): RecipientCollection
    {
        return $this->recipients;
    }

    public function getRule(): ?Rule
    {
        return $this->rule;
    }
}
