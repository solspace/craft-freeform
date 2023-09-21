<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributesArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributesType;

class AttributesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return AttributesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return AttributesArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return AttributesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Attributes entity';
    }
}
