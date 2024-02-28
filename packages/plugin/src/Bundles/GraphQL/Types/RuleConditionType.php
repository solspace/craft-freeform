<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RuleConditionInterface;

class RuleConditionType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformRuleConditionType';
    }

    public static function getTypeDefinition(): Type
    {
        return RuleConditionInterface::getType();
    }
}
