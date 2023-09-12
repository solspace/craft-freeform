<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\Spam\Honeypot\HoneypotProvider;
use Solspace\Freeform\Freeform;

class HoneypotResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $isHoneypotEnabled = Freeform::getInstance()->settings->isFreeformHoneypotEnabled();

        if (!$isHoneypotEnabled) {
            return null;
        }

        $honeypot = \Craft::$container->get(HoneypotProvider::class)->getHoneypot($source);

        if (!$honeypot) {
            return null;
        }

        return [
            'name' => $honeypot->getName(),
            'value' => $honeypot->getHash(),
        ];
    }
}
