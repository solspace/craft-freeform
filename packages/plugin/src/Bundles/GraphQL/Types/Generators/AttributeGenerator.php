<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\AttributeArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AttributeInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AttributeType;

class AttributeGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return AttributeType::class;
    }

    public static function getArgumentsClass(): string
    {
        return AttributeArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return AttributeInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Attribute entity';
    }
}
