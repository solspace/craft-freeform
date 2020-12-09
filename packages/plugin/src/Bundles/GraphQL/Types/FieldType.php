<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\helpers\StringHelper;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\FieldInterface as FreeformFieldInterface;

class FieldType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformField';
    }

    public static function getTypeDefinition(): Type
    {
        return FieldInterface::getType();
    }

    public static function resolveType($context = null): string
    {
        return self::getType($context);
    }

    public static function getType(FreeformFieldInterface $field)
    {
        return self::getTypeFromString($field->getType());
    }

    public static function getTypeFromString(string $typeName): string
    {
        return 'FreeformField_'.StringHelper::toPascalCase($typeName);
    }

    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo)
    {
        if ('values' === $resolveInfo->fieldName) {
            $resolveInfo->fieldName = 'value';
        }

        return parent::resolve($source, $arguments, $context, $resolveInfo);
    }
}
