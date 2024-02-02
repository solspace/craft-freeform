<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\NotificationTemplateArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\NotificationTemplateInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\NotificationTemplateType;

class NotificationTemplateGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return NotificationTemplateType::class;
    }

    public static function getArgumentsClass(): string
    {
        return NotificationTemplateArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return NotificationTemplateInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Notification Template entity';
    }
}
