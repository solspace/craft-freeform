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

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

class Notification
{
    public int $id;

    public string $name;

    public string $handle;

    public bool $enabled;

    public string $type;

    public ?string $icon;

    public PropertyCollection $properties;
}
