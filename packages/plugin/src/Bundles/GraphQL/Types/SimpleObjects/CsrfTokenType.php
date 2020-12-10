<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\CsrfTokenInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\AbstractObjectType;

class CsrfTokenType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'CsrfTokenType';
    }

    public static function getTypeDefinition(): Type
    {
        return CsrfTokenInterface::getType();
    }
}
