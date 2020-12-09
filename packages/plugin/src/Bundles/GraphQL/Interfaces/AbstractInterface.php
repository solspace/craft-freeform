<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use craft\gql\base\InterfaceType as BaseInterfaceType;
use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;

abstract class AbstractInterface extends BaseInterfaceType
{
    abstract public static function getTypeClass(): string;

    abstract public static function getGeneratorClass(): string;

    abstract public static function getDescription(): string;

    public static function getTypeGenerator(): string
    {
        return static::getGeneratorClass();
    }

    public static function getType($fields = null): Type
    {
        if ($type = GqlEntityRegistry::getEntity(static::getName())) {
            return $type;
        }

        $type = GqlEntityRegistry::createEntity(
            static::getName(),
            new InterfaceType(
                [
                    'name' => static::getName(),
                    'fields' => static::class.'::getFieldDefinitions',
                    'description' => static::getDescription(),
                    'resolveType' => static::getTypeClass().'::resolveType',
                ]
            )
        );

        /** @var AbstractGenerator $generatorClass */
        $generatorClass = static::getGeneratorClass();
        $generatorClass::generateTypes();

        return $type;
    }
}
