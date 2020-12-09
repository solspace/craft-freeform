<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use craft\gql\base\ObjectType;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Symfony\Component\PropertyAccess\PropertyAccess;

abstract class AbstractObjectType extends ObjectType
{
    private static $propertyAccess;

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

    protected function resolve($source, $arguments, $context, ResolveInfo $resolveInfo)
    {
        return self::getPropertyAccess()->getValue($source, $resolveInfo->fieldName);
    }

    private static function getPropertyAccess()
    {
        if (null === self::$propertyAccess) {
            self::$propertyAccess = PropertyAccess::createPropertyAccessor();
        }

        return self::$propertyAccess;
    }
}
