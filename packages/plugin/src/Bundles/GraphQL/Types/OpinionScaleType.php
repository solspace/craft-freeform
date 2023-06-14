<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OpinionScaleInterface;
use Solspace\Freeform\Fields\DataContainers\Option;

class OpinionScaleType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformOpinionScaleType';
    }

    public static function getTypeDefinition(): Type
    {
        return OpinionScaleInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     * @param mixed  $context
     */
    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo): mixed
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
