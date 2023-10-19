<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\hCaptcha\hCaptcha;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptcha;

class FormCaptchaResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $integrations = Freeform::getInstance()->integrations->getForForm($source, Type::TYPE_CAPTCHAS);
        if (!$integrations) {
            return null;
        }

        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            if ($integration instanceof ReCaptcha) {
                return [
                    'enabled' => true,
                    'handle' => 'captcha',
                    'name' => 'g-recaptcha-response',
                ];
            }

            if ($integration instanceof hCaptcha) {
                return [
                    'enabled' => true,
                    'handle' => 'captcha',
                    'name' => 'h-captcha-response',
                ];
            }
        }

        return null;
    }
}
