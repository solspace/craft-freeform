<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\DynamicNotificationInterface;
use Solspace\Freeform\Fields\DataContainers\Option;

class DynamicNotificationType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformDynamicNotificationType';
    }

    public static function getTypeDefinition(): Type
    {
        return DynamicNotificationInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('dynamicNotification' === $resolveInfo->fieldName) {
            return $source['dynamicNotification'] ?? null;
        }

        return null;
    }
}
