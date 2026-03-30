<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\Providers;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\DTO\UrlParamConfig;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\UrlParameterTracking;
use Solspace\Freeform\Services\FormsService;
use yii\caching\TagDependency;

class CookieConfigurationProvider
{
    public const CACHE_KEY = 'freeform.url-parameter-tracking.cookie-configuration';
    public const CACHE_TAG = 'freeform.url-parameter-tracking';
    public const CACHE_TTL = 60 * 60 * 12; // 12 hours

    public function __construct(
        private FormsService $formsService,
        private FormIntegrationsProvider $integrationsProvider,
    ) {}

    public function getConfiguration(): UrlParamConfig
    {
        $cache = \Craft::$app->cache;
        $dependency = new TagDependency(['tags' => self::CACHE_TAG]);

        return $cache->getOrSet(
            self::CACHE_KEY,
            function (): UrlParamConfig {
                $parameters = [];
                $ttlMinutes = UrlParameterTracking::DEFAULT_COOKIE_TTL_MINUTES;

                foreach ($this->formsService->getAllForms() as $form) {
                    $integration = $this->integrationsProvider->getSingleton(
                        $form,
                        UrlParameterTracking::class,
                        static fn ($integration) => $integration->isEnabled() && $integration->isStoreInCookies()
                    );

                    if (!$integration) {
                        continue;
                    }

                    $parameters = array_merge($parameters, $integration->getCombinedParameters());
                    $ttlMinutes = max($ttlMinutes, $integration->getCookieTtlMinutes());
                }

                $parameters = array_values(array_unique($parameters));
                sort($parameters);

                $config = new UrlParamConfig();
                $config->parameters = $parameters;
                $config->ttlMinutes = $ttlMinutes;

                return $config;
            },
            self::CACHE_TTL,
            $dependency,
        );
    }

    public function invalidate(): void
    {
        TagDependency::invalidate(\Craft::$app->cache, [self::CACHE_TAG]);
    }
}
