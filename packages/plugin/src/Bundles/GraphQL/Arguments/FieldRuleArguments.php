<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RuleConditionInterface;

class FieldRuleArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'id' => [
                'name' => 'id',
                'type' => Type::int(),
                'description' => 'The id for the rule.',
            ],
            'uid' => [
                'name' => 'uid',
                'type' => Type::string(),
                'description' => 'The uid for the rule.',
            ],
            'field' => [
                'name' => 'field',
                'type' => FieldInterface::getType(),
                'description' => 'The field for the rule.',
            ],
            'display' => [
                'name' => 'display',
                'type' => Type::string(),
                'description' => 'The display for the field rule.',
            ],
            'combinator' => [
                'name' => 'combinator',
                'type' => Type::string(),
                'description' => 'The combinator for the field rule.',
            ],
            'conditions' => [
                'name' => 'conditions',
                'type' => Type::listOf(RuleConditionInterface::getType()),
                'description' => 'The conditions for the field rule.',
            ],
        ];
    }
}
