<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\ButtonsAttributesArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\ButtonsAttributesType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\ButtonsAttributesGenerator;

class ButtonsAttributesInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformButtonsAttributesInterface';
    }

    public static function getTypeClass(): string
    {
        return ButtonsAttributesType::class;
    }

    public static function getGeneratorClass(): string
    {
        return ButtonsAttributesGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Buttons Attributes GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            ButtonsAttributesArguments::getArguments(),
            static::getName(),
        );
    }
}
