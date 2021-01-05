<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\HoneypotGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\HoneypotType;

class HoneypotInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformHoneypotInterface';
    }

    public static function getTypeClass(): string
    {
        return HoneypotType::class;
    }

    public static function getGeneratorClass(): string
    {
        return HoneypotGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'A fresh honeypot instance';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'Name',
            ],
            'hash' => [
                'name' => 'hash',
                'type' => Type::string(),
                'description' => 'Hash',
            ],
            'timestamp' => [
                'name' => 'timestamp',
                'type' => Type::int(),
                'description' => 'Timstamp of the creation date',
            ],
        ];
    }
}
