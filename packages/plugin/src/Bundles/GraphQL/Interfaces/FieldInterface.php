<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\KeyValueMapInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FieldGenerator;

class FieldInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormFieldInterface';
    }

    public static function getTypeClass(): string
    {
        return FieldType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FieldGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form Field GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return [
            'id' => [
                'name' => 'id',
                'type' => Type::int(),
                'description' => 'The Field ID',
            ],
            'type' => [
                'name' => 'type',
                'type' => Type::string(),
                'description' => 'Field type',
            ],
            'label' => [
                'name' => 'label',
                'type' => Type::string(),
                'description' => "Field's label",
            ],
            'hash' => [
                'name' => 'hash',
                'type' => Type::string(),
                'description' => "Field's hash",
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => "Field's handle",
            ],
            'instructions' => [
                'name' => 'instructions',
                'type' => Type::string(),
                'description' => "Field's instructions",
            ],
            'required' => [
                'name' => 'required',
                'type' => Type::boolean(),
                'description' => "Field's required state",
            ],
            'pageIndex' => [
                'name' => 'pageIndex',
                'type' => Type::int(),
                'description' => 'Specifies the page index the field belongs to',
            ],
            'inputAttributes' => [
                'name' => 'inputAttributes',
                'type' => Type::listOf(KeyValueMapInterface::getType()),
                'description' => "Field's input attributes",
            ],
            'labelAttributes' => [
                'name' => 'labelAttributes',
                'type' => Type::listOf(KeyValueMapInterface::getType()),
                'description' => "Field's label attributes",
            ],
            'errorAttributes' => [
                'name' => 'errorAttributes',
                'type' => Type::listOf(KeyValueMapInterface::getType()),
                'description' => "Field's error attributes",
            ],
            'instructionAttributes' => [
                'name' => 'instructionAttributes',
                'type' => Type::listOf(KeyValueMapInterface::getType()),
                'description' => "Field's instruction attributes",
            ],
        ];
    }
}
