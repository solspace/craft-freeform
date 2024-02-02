<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\NotificationTemplateInterface;

class NotificationTemplateType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformNotificationTemplateType';
    }

    public static function getTypeDefinition(): Type
    {
        return NotificationTemplateInterface::getType();
    }
}
