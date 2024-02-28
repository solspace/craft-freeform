<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;

class RuleConditionArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'uid' => [
                'name' => 'uid',
                'type' => Type::string(),
                'description' => 'The uid for the rule condition.',
            ],
            'field' => [
                'name' => 'field',
                'type' => FieldInterface::getType(),
                'description' => 'The field for the rule condition.',
            ],
            'operator' => [
                'name' => 'operator',
                'type' => Type::string(),
                'description' => 'The operator for the rule condition.',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The value for the rule condition.',
            ],
        ];
    }
}
