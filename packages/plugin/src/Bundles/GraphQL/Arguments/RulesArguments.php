<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldRuleInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageRuleInterface;

class RulesArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'pages' => [
                'name' => 'pages',
                'type' => Type::listOf(PageRuleInterface::getType()),
                'description' => 'The pages rules.',
            ],
            'fields' => [
                'name' => 'fields',
                'type' => Type::listOf(FieldRuleInterface::getType()),
                'description' => 'The fields rules.',
            ],
        ];
    }
}
