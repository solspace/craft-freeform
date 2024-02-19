<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageRuleInterface;

class PageRuleType extends AbstractObjectType
{
    public static function getName(): string
    {
        return 'FreeformPageRuleType';
    }

    public static function getTypeDefinition(): Type
    {
        return PageRuleInterface::getType();
    }
}
