<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Captchas\FriendlyCaptcha\FriendlyCaptcha;
use Solspace\Freeform\Integrations\Captchas\hCaptcha\hCaptcha;
use Solspace\Freeform\Integrations\Captchas\ReCaptcha\ReCaptcha;
use Solspace\Freeform\Integrations\Captchas\Turnstile\Turnstile;
use Solspace\Freeform\Library\Integrations\Types\Captchas\CaptchaIntegrationInterface;

class CaptchaResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        if (!$source instanceof Form) {
            return null;
        }

        return static::resolveForForm($source);
    }

    /**
     * @return null|array<int, array<string, mixed>>
     */
    public static function resolveForForm(Form $form): ?array
    {
        $integrations = Freeform::getInstance()->integrations->getForForm($form, Type::TYPE_CAPTCHAS);
        if (!$integrations) {
            return null;
        }

        $enabled = array_filter($integrations, static fn ($integration) => $integration->isEnabled());
        if (!$enabled) {
            return null;
        }

        $arguments = [];
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            $arguments[] = static::getArguments($integration);
        }

        return $arguments ?: null;
    }

    public static function resolveOne($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $arguments = [];

        $integrations = Freeform::getInstance()->integrations->getForForm($source, Type::TYPE_CAPTCHAS);
        if (!$integrations) {
            return null;
        }

        $enabled = array_filter($integrations, static fn ($integration) => $integration->isEnabled());
        if (!$enabled) {
            return null;
        }

        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            // Grab the first one and return
            $arguments = static::getArguments($integration);

            break;
        }

        return $arguments;
    }

    public static function getArguments(CaptchaIntegrationInterface $integration): array
    {
        $arguments = [
            'size' => $integration->getSize(),
            'theme' => $integration->getTheme(),
            'locale' => $integration->getLocale(),
            'errorMessage' => $integration->getErrorMessage(),
            'failureBehavior' => $integration->getFailureBehavior(),
            'triggerOnInteract' => $integration->isTriggerOnInteract(),

            /*
             * @deprecated - this attribute is no longer used
             *
             * @remove - Freeform 6.0
             */
            'enabled' => true,

            /*
             * @deprecated - this attribute is no longer used
             *
             * @remove - Freeform 6.0
             */
            'handle' => 'captcha',
        ];

        if ($integration instanceof ReCaptcha) {
            $arguments['provider'] = 'recaptcha';
            $arguments['siteKey'] = $integration->getSiteKey();
            $arguments['action'] = $integration->getAction();
            $arguments['version'] = $integration->getVersion();
            $arguments['scoreThreshold'] = $integration->getScoreThreshold();
            $arguments['name'] = 'g-recaptcha-response';
        }

        if ($integration instanceof hCaptcha) {
            $arguments['provider'] = 'hcaptcha';
            $arguments['siteKey'] = $integration->getSiteKey();
            $arguments['action'] = null;
            $arguments['version'] = $integration->getVersion();
            $arguments['scoreThreshold'] = null;
            $arguments['name'] = 'h-captcha-response';
        }

        if ($integration instanceof Turnstile) {
            $arguments['provider'] = 'turnstile';
            $arguments['siteKey'] = $integration->getSiteKey();
            $arguments['action'] = $integration->getAction();
            $arguments['version'] = null;
            $arguments['scoreThreshold'] = null;
            $arguments['name'] = 'cf-turnstile-response';
        }

        if ($integration instanceof FriendlyCaptcha) {
            $arguments['provider'] = 'friendly-captcha';
            $arguments['siteKey'] = $integration->getSiteKey();
            $arguments['action'] = null;
            $arguments['version'] = null;
            $arguments['scoreThreshold'] = null;
            $arguments['name'] = 'frc-captcha-response';
            $arguments['startMode'] = $integration->getStartMode();
            $arguments['apiEndpoint'] = 'global';
        }

        return $arguments;
    }
}
