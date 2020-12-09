<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\ScalesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;
use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

class ScalesType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'ScalesType';
    }

    public static function getTypeDefinition(): Type
    {
        return ScalesInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     * @param mixed  $context
     */
    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo)
    {
        if ('value' === $resolveInfo->fieldName) {
            return $source['value'] ?? null;
        }

        if ('label' === $resolveInfo->fieldName) {
            return $source['label'] ?? null;
        }

        return null;
    }
}
