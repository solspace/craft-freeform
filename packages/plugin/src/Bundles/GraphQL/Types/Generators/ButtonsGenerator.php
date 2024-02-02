<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\ButtonsArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\ButtonsInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\ButtonsType;

class ButtonsGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return ButtonsType::class;
    }

    public static function getArgumentsClass(): string
    {
        return ButtonsArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return ButtonsInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Buttons entity';
    }
}
