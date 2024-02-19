<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldRuleInterface;

class FieldRuleType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFieldRuleType';
    }

    public static function getTypeDefinition(): Type
    {
        return FieldRuleInterface::getType();
    }
}
