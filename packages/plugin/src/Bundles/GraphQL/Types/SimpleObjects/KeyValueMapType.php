<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\KeyValueMapInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;

class KeyValueMapType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'KeyValueMapType';
    }

    public static function getTypeDefinition(): Type
    {
        return KeyValueMapInterface::getType();
    }

    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo)
    {
        if ('value' === $resolveInfo->fieldName) {
            return $source['value'] ?? null;
        }

        if ('key' === $resolveInfo->fieldName) {
            return $source['attribute'] ?? null;
        }

        return null;
    }
}
