<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Form\Form;

class RulesResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        if (!$source instanceof Form) {
            return null;
        }

        $rulesProvider = \Craft::$container->get(RuleProvider::class);

        return $rulesProvider->getFormRules($source);
    }
}
