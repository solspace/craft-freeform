<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class AttributeArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'attribute' => [
                'name' => 'attribute',
                'type' => Type::string(),
                'description' => 'The attribute name.',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The attribute value.',
            ],
        ];
    }
}
