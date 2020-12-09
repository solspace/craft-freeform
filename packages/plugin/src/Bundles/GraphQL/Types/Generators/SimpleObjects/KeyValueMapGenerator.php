<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects\KeyValueMapArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\KeyValueMapInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\AbstractGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\KeyValueMapType;

class KeyValueMapGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return KeyValueMapType::class;
    }

    public static function getArgumentsClass(): string
    {
        return KeyValueMapArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return KeyValueMapInterface::class;
    }

    public static function getDescription(): string
    {
        return 'A key=>value object';
    }
}
