<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;

class AttributesArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'input' => [
                'name' => 'input',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The input attributes.',
            ],
            'label' => [
                'name' => 'label',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The label attributes.',
            ],
            'instructions' => [
                'name' => 'instructions',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The instructions attributes.',
            ],
            'container' => [
                'name' => 'container',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The container attributes.',
            ],
            'error' => [
                'name' => 'error',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The error attributes.',
            ],
        ];
    }
}
