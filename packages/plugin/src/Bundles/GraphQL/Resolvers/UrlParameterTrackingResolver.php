<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;

class UrlParameterTrackingResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        if (!$source instanceof Form) {
            return null;
        }

        $integrationProvider = \Craft::$container->get(FormIntegrationsProvider::class);
        $urlParameterTracking = $integrationProvider->getSingleton($source, UrlParameterTracking::class);
        if (!$urlParameterTracking) {
            return null;
        }

        return [
            'parameters' => $urlParameterTracking->getCombinedParameters(),
        ];
    }
}
