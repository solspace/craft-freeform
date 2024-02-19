<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use Solspace\Freeform\Bundles\GraphQL\Arguments\PageRuleArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\PageRuleInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\PageRuleType;

class PageRuleGenerator extends AbstractGenerator
{
    public static function getTypeClass(): string
    {
        return PageRuleType::class;
    }

    public static function getArgumentsClass(): string
    {
        return PageRuleArguments::class;
    }

    public static function getInterfaceClass(): string
    {
        return PageRuleInterface::class;
    }

    public static function getDescription(): string
    {
        return 'The Freeform Page Rule entity';
    }
}
