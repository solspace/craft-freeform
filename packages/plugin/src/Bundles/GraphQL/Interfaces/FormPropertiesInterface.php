<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FormPropertiesArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\FormPropertiesType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FormPropertiesGenerator;

class FormPropertiesInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormPropertiesInterface';
    }

    public static function getTypeClass(): string
    {
        return FormPropertiesType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FormPropertiesGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form Properties GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            FormPropertiesArguments::getArguments(),
            static::getName(),
        );
    }
}
