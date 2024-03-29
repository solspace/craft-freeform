<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\PageGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\PageType;

class PageInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformPageInterface';
    }

    public static function getTypeClass(): string
    {
        return PageType::class;
    }

    public static function getGeneratorClass(): string
    {
        return PageGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Page GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'index' => [
                'name' => 'index',
                'type' => Type::int(),
                'description' => 'The page index',
            ],
            'label' => [
                'name' => 'label',
                'type' => Type::string(),
                'description' => 'The page label',
            ],
            'buttons' => [
                'name' => 'buttons',
                'type' => ButtonsInterface::getType(),
                'description' => 'The page buttons',
            ],
            // Layout
            'rows' => [
                'name' => 'rows',
                'type' => Type::listOf(RowInterface::getType()),
                'description' => "Page's rows",
            ],
        ], static::getName());
    }
}
