<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\OptionGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\OptionType;

class OptionInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformOptionInterface';
    }

    public static function getTypeClass(): string
    {
        return OptionType::class;
    }

    public static function getGeneratorClass(): string
    {
        return OptionGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Option GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => "Option's value",
            ],
            'label' => [
                'name' => 'label',
                'type' => Type::string(),
                'description' => "Option's label",
            ],
            'checked' => [
                'name' => 'checked',
                'type' => Type::boolean(),
                'description' => 'Is the option checked',
            ],
        ], static::getName());
    }
}
