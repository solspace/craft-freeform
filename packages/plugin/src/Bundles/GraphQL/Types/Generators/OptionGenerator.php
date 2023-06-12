<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\OptionArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OptionInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\OptionType;

class OptionGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return OptionType::class;
    }

    public static function getArgumentsClass(): string
    {
        return OptionArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return OptionInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Option entity';
    }
}
