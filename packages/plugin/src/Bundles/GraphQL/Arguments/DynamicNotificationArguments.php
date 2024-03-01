<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\ListOfType;
use GraphQL\Type\Definition\Type;

class DynamicNotificationArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'recipients' => [
                'name' => 'recipients',
                'type' => ListOfType::listOf(Type::string()),
                'description' => 'The dynamic notification recipients.',
            ],
            'template' => [
                'name' => 'template',
                'type' => Type::string(),
                'description' => 'The dynamic notification template.',
            ],
        ];
    }
}
