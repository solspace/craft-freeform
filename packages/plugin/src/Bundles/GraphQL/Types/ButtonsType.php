<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\ButtonsInterface;

class ButtonsType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformButtonsType';
    }

    public static function getTypeDefinition(): Type
    {
        return ButtonsInterface::getType();
    }
}
