<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessor;

abstract class AbstractObjectType extends ObjectType
{
    private static ?PropertyAccessor $propertyAccess = null;

    public function __construct(array $config)
    {
        $config['interfaces'] = [static::getTypeDefinition()];

        parent::__construct($config);
    }

    public static function resolveType($context = null): string
    {
        return static::getName();
    }

    abstract public static function getName(): string;

    abstract public static function getTypeDefinition(): Type;

    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo): mixed
    {
        return self::getPropertyAccess()->getValue($source, $resolveInfo->fieldName);
    }

    private static function getPropertyAccess(): PropertyAccessor
    {
        if (null === self::$propertyAccess) {
            self::$propertyAccess = PropertyAccess::createPropertyAccessor();
        }

        return self::$propertyAccess;
    }
}
