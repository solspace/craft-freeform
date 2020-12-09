<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\base\GeneratorInterface;
use craft\gql\base\ObjectType;
use craft\gql\GqlEntityRegistry;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;

abstract class AbstractGenerator implements GeneratorInterface
{
    abstract public static function getTypeClass(): string;

    abstract public static function getArgumentsClass(): string;

    abstract public static function getInterfaceClass(): string;

    abstract public static function getDescription(): string;

    public static function getName(): string
    {
        /** @var AbstractObjectType $class */
        $class = static::getTypeClass();

        return $class::getName();
    }

    public static function generateTypes($context = null): array
    {
        $typeName = static::getName();

        $type = GqlEntityRegistry::getEntity($typeName);
        if (!$type) {
            $type = GqlEntityRegistry::createEntity(
                $typeName,
                static::instantiateType(
                    [
                        'name' => $typeName,
                        'description' => static::getDescription(),
                        'args' => static::getArgumentsClass().'::getArguments',
                        'fields' => static::getInterfaceClass().'::getFieldDefinitions',
                    ]
                )
            );
        }

        return [$typeName => $type];
    }

    private static function instantiateType(array $config): ObjectType
    {
        /** @var AbstractObjectType $class */
        $class = static::getTypeClass();

        return new $class($config);
    }
}
