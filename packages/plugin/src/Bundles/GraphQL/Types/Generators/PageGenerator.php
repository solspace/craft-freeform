<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\PageArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\PageType;

class PageGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return PageType::class;
    }

    public static function getArgumentsClass(): string
    {
        return PageArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return PageInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Form Page entity';
    }
}
