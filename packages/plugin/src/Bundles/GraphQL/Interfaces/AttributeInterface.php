<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributeArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributeType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AttributeGenerator;

class AttributeInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformAttributeInterface';
    }

    public static function getTypeClass(): string
    {
        return AttributeType::class;
    }

    public static function getGeneratorClass(): string
    {
        return AttributeGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Attribute GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            AttributeArguments::getArguments(),
            static::getName(),
        );
    }
}
