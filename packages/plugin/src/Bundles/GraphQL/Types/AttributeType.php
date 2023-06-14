<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;
use Solspace\Freeform\Fields\DataContainers\Option;

class AttributeType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformAttributeType';
    }

    public static function getTypeDefinition(): Type
    {
        return AttributeInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('attribute' === $resolveInfo->fieldName) {
            return $source['attribute'] ?? null;
        }

        if ('value' === $resolveInfo->fieldName) {
            return $source['value'] ?? null;
        }

        return null;
    }
}
