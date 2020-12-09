<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects\KeyValueMapArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\ScalesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\ScalesType;

class ScalesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return ScalesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return KeyValueMapArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return ScalesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'Opinion Scales';
    }
}
