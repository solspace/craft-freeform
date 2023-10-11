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
        ];
    }
}
