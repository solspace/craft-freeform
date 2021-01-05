<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\KeyValueMapGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\KeyValueMapType;

class KeyValueMapInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformKeyValueMapInterface';
    }

    public static function getTypeClass(): string
    {
        return KeyValueMapType::class;
    }

    public static function getGeneratorClass(): string
    {
        return KeyValueMapGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'A { key => value } map';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'key' => [
                'name' => 'key',
                'type' => Type::string(),
                'description' => 'The value of the key',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The value',
            ],
        ];
    }
}
