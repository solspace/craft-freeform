<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FormArguments;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FormResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FreeformGenerator;

class FreeformInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformInterface';
    }

    public static function getTypeClass(): string
    {
        return FreeformType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FreeformGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'version' => [
                'name' => 'version',
                'type' => Type::string(),
                'description' => 'Freeform version',
            ],
            'forms' => [
                'name' => 'forms',
                'type' => Type::listOf(FormInterface::getType()),
                'resolve' => FormResolver::class.'::resolve',
                'args' => FormArguments::getArguments(),
                'description' => 'Freeform forms',
            ],
            'form' => [
                'name' => 'form',
                'type' => FormInterface::getType(),
                'resolve' => FormResolver::class.'::resolveOne',
                'args' => FormArguments::getArguments(),
                'description' => 'Freeform forms',
            ],
        ];
    }
}
