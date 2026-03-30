<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class UrlParameterTrackingArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'parameters' => [
                'name' => 'parameters',
                'type' => Type::listOf(Type::string()),
                'description' => 'The list of URL paramter tracking names for this form.',
            ],
        ];
    }
}
