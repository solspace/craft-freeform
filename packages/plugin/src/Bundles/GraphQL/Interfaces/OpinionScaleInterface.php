<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\OpinionScaleGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\OpinionScaleType;

class OpinionScaleInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformOpinionScaleInterface';
    }

    public static function getTypeClass(): string
    {
        return OpinionScaleType::class;
    }

    public static function getGeneratorClass(): string
    {
        return OpinionScaleGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Opinion Scale GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
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
        ], static::getName());
    }
}
