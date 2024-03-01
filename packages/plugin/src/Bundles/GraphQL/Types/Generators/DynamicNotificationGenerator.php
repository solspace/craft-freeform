<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\DynamicNotificationArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\DynamicNotificationInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\DynamicNotificationType;

class DynamicNotificationGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return DynamicNotificationType::class;
    }

    public static function getArgumentsClass(): string
    {
        return DynamicNotificationArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return DynamicNotificationInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Dynamic Notification entity';
    }
}
