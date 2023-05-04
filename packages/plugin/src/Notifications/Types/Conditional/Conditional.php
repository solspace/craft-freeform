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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Conditional Notifications',
    newInstanceName: 'Conditional',
    icon: __DIR__.'/icon.svg',
)]
class Conditional extends BaseNotification
{
    #[Input\ConditionalRule(
        label: 'Notification Rule',
        instructions: 'Select a rule to use for this notification.',
    )]
    protected ConditionalNotificationRule $rule;
}
