<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\RowArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RowInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\RowType;

class RowGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return RowType::class;
    }

    public static function getArgumentsClass(): string
    {
        return RowArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return RowInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form Row entity';
    }
}
