<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use Solspace\Freeform\Bundles\GraphQL\Arguments\PageRuleArguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\PageRuleGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\PageRuleType;

class PageRuleInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformPageRuleInterface';
    }

    public static function getTypeClass(): string
    {
        return PageRuleType::class;
    }

    public static function getGeneratorClass(): string
    {
        return PageRuleGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Page Rule GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            PageRuleArguments::getArguments(),
            static::getName(),
        );
    }
}
