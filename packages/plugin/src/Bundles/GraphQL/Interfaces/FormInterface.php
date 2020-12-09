<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldArguments;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FieldResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\PageResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\FormType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FormGenerator;

class FormInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormInterface';
    }

    public static function getTypeClass(): string
    {
        return FormType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FormGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'id' => [
                'name' => 'id',
                'type' => Type::int(),
                'description' => "The form's ID",
            ],
            'uid' => [
                'name' => 'uid',
                'type' => Type::string(),
                'description' => "The form's UID",
            ],
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => "The form's name",
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => "The form's handle",
            ],
            'color' => [
                'name' => 'color',
                'type' => Type::string(),
                'description' => "The form's color hex",
            ],
            'description' => [
                'name' => 'description',
                'type' => Type::string(),
                'description' => "The form's handle",
            ],
            'returnUrl' => [
                'name' => 'returnUrl',
                'type' => Type::string(),
                'description' => "The form's return URL",
            ],
            'storeData' => [
                'name' => 'storeData',
                'type' => Type::boolean(),
                'description' => 'Whether the form stores submissions or not',
            ],
            'defaultStatus' => [
                'name' => 'defaultStatus',
                'type' => Type::int(),
                'description' => "The form's default status ID",
            ],
            'formTemplate' => [
                'name' => 'formTemplate',
                'type' => Type::string(),
                'description' => "The form's formatting template filename",
            ],
            // Layout
            'pages' => [
                'name' => 'pages',
                'type' => Type::listOf(PageInterface::getType()),
                'resolve' => PageResolver::class.'::resolve',
                'description' => 'The form’s pages.',
            ],
            'fields' => [
                'name' => 'fields',
                'type' => Type::listOf(FieldInterface::getType()),
                'resolve' => FieldResolver::class.'::resolve',
                'args' => FieldArguments::getArguments(),
                'description' => "Form's fields",
            ],
        ];
    }
}
