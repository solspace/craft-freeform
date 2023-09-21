<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FieldGenerator;

class FieldInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFieldInterface';
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
        return 'Freeform Field GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
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
            'attributes' => [
                'name' => 'attributes',
                'type' => AttributesInterface::getType(),
                'description' => "Field's attributes",
                'resolve' => function ($source) {
                    return $source->getAttributes();
                },
            ],
            'rules' => [
                'name' => 'rules',
                'type' => Type::string(),
                'description' => "Field's rules",
                'resolve' => function ($source) {
                    // FIXME
                    return null; // $source->getRules();
                },
            ],
        ], static::getName());
    }
}
