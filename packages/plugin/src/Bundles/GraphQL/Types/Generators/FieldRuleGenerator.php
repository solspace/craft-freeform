<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldRuleArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldRuleInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldRuleType;

class FieldRuleGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FieldRuleType::class;
    }

    public static function getArgumentsClass(): string
    {
        return FieldRuleArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FieldRuleInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Field Rule entity';
    }
}
