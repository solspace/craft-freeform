<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\FreeformArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformType;

class FreeformGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return FreeformType::class;
    }

    public static function getArgumentsClass(): string
    {
        return FreeformArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return FreeformInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform entity';
    }
}
