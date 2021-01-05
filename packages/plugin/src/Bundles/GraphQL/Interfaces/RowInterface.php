<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldArguments;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FieldResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\RowGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\RowType;

class RowInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormRowInterface';
    }

    public static function getTypeClass(): string
    {
        return RowType::class;
    }

    public static function getGeneratorClass(): string
    {
        return RowGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form Row GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'id' => [
                'name' => 'id',
                'type' => Type::string(),
                'description' => 'The Row ID',
            ],
            'fields' => [
                'name' => 'fields',
                'type' => Type::listOf(FieldInterface::getType()),
                'resolve' => FieldResolver::class.'::resolve',
                'args' => FieldArguments::getArguments(),
                'description' => "Row's fields",
            ],
        ];
    }
}
