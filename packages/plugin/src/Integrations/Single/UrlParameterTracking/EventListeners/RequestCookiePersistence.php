<?php

namespace Solspace\Freeform\Integrations\Single\UrlParameterTracking\EventListeners;

use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Providers\CookieConfigurationProvider;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Services\UrlParameterTrackingResolver;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Application;
use yii\base\Event;

class RequestCookiePersistence extends FeatureBundle
{
    public function __construct(
        private CookieConfigurationProvider $cookieConfigurationProvider,
        private UrlParameterTrackingResolver $resolver,
    ) {
        Event::on(
            Application::class,
            Application::EVENT_BEFORE_REQUEST,
            [$this, 'persistRequestValues'],
        );
    }

    public function persistRequestValues(): void
    {
        $request = \Craft::$app->request;
        if ($request->isConsoleRequest || !$request->getIsSiteRequest()) {
            return;
        }

        $config = $this->cookieConfigurationProvider->getConfiguration();
        $trackedParameters = $config->parameters;
        $ttlMinutes = $config->ttlMinutes;

        $isRequestEmpty = !$this->resolver->requestContainsValues($trackedParameters);
        if ($isRequestEmpty) {
            return;
        }

        $this->resolver->persistCookieValues($trackedParameters, $ttlMinutes);
    }
}
