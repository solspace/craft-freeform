<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\ScalesGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\ScalesType;

class ScalesInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformScalesInterface';
    }

    public static function getTypeClass(): string
    {
        return ScalesType::class;
    }

    public static function getGeneratorClass(): string
    {
        return ScalesGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Opinion scales';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'Value',
            ],
            'label' => [
                'name' => 'label',
                'type' => Type::string(),
                'description' => 'Label',
            ],
        ];
    }
}
