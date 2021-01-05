<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class FieldArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'id' => [
                'name' => 'id',
                'type' => Type::listOf(Type::int()),
                'description' => 'Filter fields by their IDs',
            ],
            'hash' => [
                'name' => 'hash',
                'type' => Type::listOf(Type::string()),
                'description' => 'Filter fields by their hash',
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::listOf(Type::string()),
                'description' => 'Filter fields by their handles',
            ],
        ];
    }
}
