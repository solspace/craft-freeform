<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormPropertiesInterface;
use Solspace\Freeform\Fields\DataContainers\Option;

class FormPropertiesType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFormPropertiesType';
    }

    public static function getTypeDefinition(): Type
    {
        return FormPropertiesInterface::getType();
    }

    /**
     * @param Option $source
     * @param mixed  $arguments
     */
    protected function resolve($source, $arguments, mixed $context, ResolveInfo $resolveInfo): mixed
    {
        if ('formProperties' === $resolveInfo->fieldName) {
            return $source['formProperties'] ?? null;
        }

        return null;
    }
}
