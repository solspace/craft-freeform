<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Freeform;

class HoneypotResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $freeform = Freeform::getInstance();

        $settingsService = $freeform->settings;
        $honeypotService = $freeform->honeypot;

        if ($settingsService->isFreeformHoneypotEnabled($source)) {
            $honeypot = $honeypotService->getHoneypot($source);

            return [
                'name' => $honeypot->getName(),
                'value' => $honeypot->getHash(),
                // @deprecated Please do not use
                'hash' => null,
                // @deprecated Please do not use
                'timestamp' => null,
            ];
        }

        return null;
    }
}
