<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldRuleArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldRuleType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FieldRuleGenerator;

class FieldRuleInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFieldRuleInterface';
    }

    public static function getTypeClass(): string
    {
        return FieldRuleType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FieldRuleGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Field Rule GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            FieldRuleArguments::getArguments(),
            static::getName(),
        );
    }
}
