<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageInterface;

class PageType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformFormPageType';
    }

    public static function getTypeDefinition(): Type
    {
        return PageInterface::getType();
    }
}
