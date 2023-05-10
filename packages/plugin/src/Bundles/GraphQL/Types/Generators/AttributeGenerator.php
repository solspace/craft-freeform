<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\base\Generator;
use craft\gql\base\GeneratorInterface;
use craft\gql\base\SingleGeneratorInterface;
use craft\gql\GqlEntityRegistry;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributeType;

class AttributeGenerator extends Generator implements GeneratorInterface, SingleGeneratorInterface
{
    public static function getName(): string
    {
        return 'FreeformAttributeType';
    }

    public static function generateTypes(mixed $context = null): array
    {
        return [
            self::generateType($context),
        ];
    }

    public static function generateType(mixed $context = null): mixed
    {
        if ($type = GqlEntityRegistry::getEntity(self::getName())) {
            return $type;
        }

        $fields = AttributeType::prepareRowFieldDefinition(self::getName());

        return GqlEntityRegistry::createEntity(self::getName(), new AttributeType([
            'name' => self::getName(),
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }
}
