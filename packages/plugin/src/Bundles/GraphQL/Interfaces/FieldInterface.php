<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\FieldType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FieldGenerator;
use Solspace\Freeform\Library\Attributes\Attributes;

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
            // @deprecated
            'hash' => [
                'name' => 'hash',
                'type' => Type::string(),
                'description' => "Field's hash",
                'resolve' => function () {
                    return 'This property is deprecated';
                },
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
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Field's input attributes",
                'resolve' => function ($source) {
                    return self::transform($source->getAttributes()->getInput());
                },
            ],
            'labelAttributes' => [
                'name' => 'labelAttributes',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Field's label attributes",
                'resolve' => function ($source) {
                    return self::transform($source->getAttributes()->getLabel());
                },
            ],
            'errorAttributes' => [
                'name' => 'errorAttributes',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Field's error attributes",
                'resolve' => function ($source) {
                    return self::transform($source->getAttributes()->getError());
                },
            ],
            'instructionAttributes' => [
                'name' => 'instructionAttributes',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Field's instruction attributes",
                'resolve' => function ($source) {
                    return self::transform($source->getAttributes()->getInstructions());
                },
            ],
            'containerAttributes' => [
                'name' => 'containerAttributes',
                'type' => Type::listOf(AttributeInterface::getType()),
                'description' => "Field's container attributes",
                'resolve' => function ($source) {
                    return self::transform($source->getAttributes()->getContainer());
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

    private static function transform(Attributes $fieldAttributes): array
    {
        $attributes = [];

        foreach ($fieldAttributes->toArray() as $attribute => $value) {
            $attributes[] = [
                'value' => $value,
                'attribute' => $attribute,
            ];
        }

        return $attributes;
    }
}
