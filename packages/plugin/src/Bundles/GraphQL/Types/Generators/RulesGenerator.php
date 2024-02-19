<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\RulesArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RulesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\RulesType;

class RulesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return RulesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return RulesArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return RulesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Rules entity';
    }
}
