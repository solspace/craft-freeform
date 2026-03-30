<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\UrlParameterTrackingArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\UrlParameterTrackingGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\UrlParameterTrackingType;

class UrlParameterTrackingInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformUrlParameterTrackingInterface';
    }

    public static function getTypeClass(): string
    {
        return UrlParameterTrackingType::class;
    }

    public static function getGeneratorClass(): string
    {
        return UrlParameterTrackingGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform URL Parameter Tracking GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            UrlParameterTrackingArguments::getArguments(),
            static::getName(),
        );
    }
}
