<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\UrlParameterTrackingArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\UrlParameterTrackingInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\UrlParameterTrackingType;

class UrlParameterTrackingGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return UrlParameterTrackingType::class;
    }

    public static function getArgumentsClass(): string
    {
        return UrlParameterTrackingArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return UrlParameterTrackingInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform URL Parameter Tracking entity';
    }
}
