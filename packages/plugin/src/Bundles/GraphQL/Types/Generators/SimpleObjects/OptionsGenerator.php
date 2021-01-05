<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects\EmptyArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\OptionsInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\OptionsType;

class OptionsGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return OptionsType::class;
    }

    public static function getArgumentsClass(): string
    {
        return EmptyArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return OptionsInterface::class;
    }

    public static function getDescription(): string
    {
        return 'A key=>value object';
    }
}
