<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RuleConditionInterface;

class PageRuleArguments extends Arguments
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
            'page' => [
                'name' => 'page',
                'type' => PageInterface::getType(),
                'description' => 'The page for the rule.',
            ],
            'combinator' => [
                'name' => 'combinator',
                'type' => Type::string(),
                'description' => 'The combinator for the page rule.',
            ],
            'conditions' => [
                'name' => 'conditions',
                'type' => Type::listOf(RuleConditionInterface::getType()),
                'description' => 'The conditions for the page rule.',
            ],
        ];
    }
}
