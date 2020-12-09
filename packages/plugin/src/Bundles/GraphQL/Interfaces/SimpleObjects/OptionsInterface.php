<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\OptionsGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\OptionsType;

class OptionsInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformOptionsInterface';
    }

    public static function getTypeClass(): string
    {
        return OptionsType::class;
    }

    public static function getGeneratorClass(): string
    {
        return OptionsGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'A { key => value } map';
    }

    public static function getFieldDefinitions(): array
    {
        return [
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
        ];
    }
}
