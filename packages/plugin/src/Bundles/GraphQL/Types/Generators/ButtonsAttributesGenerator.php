<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\ButtonsAttributesArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\ButtonsAttributesInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\ButtonsAttributesType;

class ButtonsAttributesGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return ButtonsAttributesType::class;
    }

    public static function getArgumentsClass(): string
    {
        return ButtonsAttributesArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return ButtonsAttributesInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Buttons Attributes entity';
    }
}
