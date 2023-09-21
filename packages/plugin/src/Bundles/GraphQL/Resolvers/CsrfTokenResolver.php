<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;

class CsrfTokenResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $generalConfig = \Craft::$app->getConfig()->getGeneral();
        if (!$generalConfig->enableCsrfProtection) {
            return null;
        }

        return [
            'name' => $generalConfig->csrfTokenName,
            'value' => \Craft::$app->getRequest()->getCsrfToken(),
        ];
    }
}
