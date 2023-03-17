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

namespace Solspace\Freeform\Library\DataObjects\Notifications;

class NotificationSetting
{
    public string $name;

    public string $handle;

    public string $type;

    public string $instructions;

    public mixed $value;

    public bool $required;
}
