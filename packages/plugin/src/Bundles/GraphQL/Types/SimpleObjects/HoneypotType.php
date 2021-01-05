<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\HoneypotInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;

class HoneypotType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'HoneypotType';
    }

    public static function getTypeDefinition(): Type
    {
        return HoneypotInterface::getType();
    }
}
