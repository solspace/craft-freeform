<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class HeadlessManifestArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'handle' => [
                'name' => 'handle',
                'type' => Type::nonNull(Type::string()),
                'description' => 'Freeform form handle',
            ],
        ];
    }
}
