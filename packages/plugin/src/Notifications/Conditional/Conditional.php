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

namespace Solspace\Freeform\Notifications\Conditional;

use Solspace\Freeform\Attributes\Notification\Type;
use Solspace\Freeform\Notifications\BaseNotification;

#[Type(
    name: 'Conditional',
    iconPath: __DIR__.'/icon.svg',
)]
class Conditional extends BaseNotification
{
    public const TYPE = 'conditional';

    public const LOG_CATEGORY = 'Conditional Notification';
}
