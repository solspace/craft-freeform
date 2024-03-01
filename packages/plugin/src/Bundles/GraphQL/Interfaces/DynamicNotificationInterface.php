<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\DynamicNotificationArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\DynamicNotificationType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\DynamicNotificationGenerator;

class DynamicNotificationInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformDynamicNotificationInterface';
    }

    public static function getTypeClass(): string
    {
        return DynamicNotificationType::class;
    }

    public static function getGeneratorClass(): string
    {
        return DynamicNotificationGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Dynamic Notification GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->getGql()->prepareFieldDefinitions(
            DynamicNotificationArguments::getArguments(),
            self::getName()
        );
    }
}
