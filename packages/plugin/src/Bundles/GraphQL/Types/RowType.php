<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\RowInterface;

class RowType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFormRow';
    }

    public static function getTypeDefinition(): Type
    {
        return RowInterface::getType();
    }
}
