<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;

class CsrfTokenResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        if (\Craft::$app->getConfig()->getGeneral()->enableCsrfProtection) {
            return [
                'name' => \Craft::$app->getConfig()->getGeneral()->csrfTokenName,
                'value' => \Craft::$app->getRequest()->getCsrfToken(),
            ];
        }

        return null;
    }
}
