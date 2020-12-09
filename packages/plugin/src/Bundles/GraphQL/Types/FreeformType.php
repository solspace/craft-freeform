<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;

class FreeformType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformType';
    }

    public static function getTypeDefinition(): Type
    {
        return FreeformInterface::getType();
    }
}
