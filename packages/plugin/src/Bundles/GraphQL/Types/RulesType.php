<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RulesInterface;
use Solspace\Freeform\Fields\DataContainers\Option;

class RulesType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformRulesType';
    }

    public static function getTypeDefinition(): Type
    {
        return RulesInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('pages' === $resolveInfo->fieldName) {
            return $source['pages'] ?? null;
        }

        if ('fields' === $resolveInfo->fieldName) {
            return $source['fields'] ?? null;
        }

        return null;
    }
}
