<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;

class ButtonsAttributesArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'container' => [
                'name' => 'container',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The container attributes.',
            ],
            'column' => [
                'name' => 'column',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The column attributes.',
            ],
            'buttonWrapper' => [
                'name' => 'buttonWrapper',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The button wrapper attributes.',
            ],
            'submit' => [
                'name' => 'submit',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The submit attributes.',
            ],
            'back' => [
                'name' => 'back',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The back attributes.',
            ],
            'save' => [
                'name' => 'save',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => 'The save attributes.',
            ],
        ];
    }
}
