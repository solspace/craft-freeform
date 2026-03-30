<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\UrlParameterTrackingInterface;

class UrlParameterTrackingType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformUrlParameterTrackingType';
    }

    public static function getTypeDefinition(): Type
    {
        return UrlParameterTrackingInterface::getType();
    }

    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('parameters' === $resolveInfo->fieldName) {
            return $source['parameters'] ?? null;
        }

        return null;
    }
}
