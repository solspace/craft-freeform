<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\HoneypotInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

class HoneypotType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformHoneypotType';
    }

    public static function getTypeDefinition(): Type
    {
        return HoneypotInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('name' === $resolveInfo->fieldName) {
            return $source['name'] ?? null;
        }

        if ('value' === $resolveInfo->fieldName) {
            return $source['value'] ?? null;
        }

        return null;
    }
}
