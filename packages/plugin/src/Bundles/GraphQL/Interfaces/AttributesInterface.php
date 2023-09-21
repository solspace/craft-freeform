<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributesArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributesType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AttributesGenerator;

class AttributesInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformAttributesInterface';
    }

    public static function getTypeClass(): string
    {
        return AttributesType::class;
    }

    public static function getGeneratorClass(): string
    {
        return AttributesGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Attributes GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            AttributesArguments::getArguments(),
            static::getName(),
        );
    }
}
