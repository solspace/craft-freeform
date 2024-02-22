<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\RuleConditionArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\RuleConditionGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\RuleConditionType;

class RuleConditionInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformRuleConditionInterface';
    }

    public static function getTypeClass(): string
    {
        return RuleConditionType::class;
    }

    public static function getGeneratorClass(): string
    {
        return RuleConditionGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Rule Condition GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            RuleConditionArguments::getArguments(),
            static::getName(),
        );
    }
}
