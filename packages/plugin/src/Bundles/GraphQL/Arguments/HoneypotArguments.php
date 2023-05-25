<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class HoneypotArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The Honeypot field name.',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The Honeypot field value.',
            ],
            // @deprecated Please do not use
            'hash' => [
                'name' => 'hash',
                'type' => Type::string(),
                'description' => 'Hash',
            ],
            // @deprecated Please do not use
            'timestamp' => [
                'name' => 'timestamp',
                'type' => Type::int(),
                'description' => 'Timestamp of the creation date',
            ],
        ];
    }
}
