<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\RuleConditionArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RuleConditionInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\RuleConditionType;

class RuleConditionGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return RuleConditionType::class;
    }

    public static function getArgumentsClass(): string
    {
        return RuleConditionArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return RuleConditionInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Rule Condition entity';
    }
}
