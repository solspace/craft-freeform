<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\OpinionScaleArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\OpinionScaleInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\OpinionScaleType;

class OpinionScaleGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return OpinionScaleType::class;
    }

    public static function getArgumentsClass(): string
    {
        return OpinionScaleArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return OpinionScaleInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Opinion Scale entity';
    }
}
