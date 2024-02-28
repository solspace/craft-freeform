<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\RulesArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\RulesGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\RulesType;

class RulesInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformRulesInterface';
    }

    public static function getTypeClass(): string
    {
        return RulesType::class;
    }

    public static function getGeneratorClass(): string
    {
        return RulesGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Rules GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            RulesArguments::getArguments(),
            static::getName(),
        );
    }
}
