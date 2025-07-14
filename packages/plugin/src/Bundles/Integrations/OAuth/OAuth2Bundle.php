<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use craft\web\UrlRule;
use Solspace\Freeform\Bundles\Integrations\OAuth\Controllers\OAuth2AuthController;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;

class OAuth2Bundle extends FeatureBundle
{
    public function __construct()
    {
        $this->registerController('oauth2-auth', OAuth2AuthController::class);

        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            [$this, 'onAfterAuthorize']
        );

        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            [$this, 'registerCpRoutes'],
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            [$this, 'registerRoutes'],
        );
    }

    public function onAfterAuthorize(TokenPayloadEvent $event): void
    {
        $integration = $event->getIntegration();
        $payload = $event->getResponsePayload();

        if (!isset($payload->access_token)) {
            throw new IntegrationException(
                Freeform::t(
                    "No 'access_token' present in auth response for {serviceProvider}",
                    ['serviceProvider' => $integration->getServiceProvider()]
                )
            );
        }

        $integration->setAccessToken($payload->access_token);
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            return;
        }

        $event->addConfig(
            [
                'headers' => [
                    'Authorization' => 'Bearer '.$integration->getAccessToken(),
                    'Content-Type' => 'application/json',
                ],
            ]
        );
    }

    public function registerCpRoutes(RegisterUrlRulesEvent $event): void
    {
        /*
         * Legacy URL for OAuth2 redirect callback
         *
         * @deprecated will be removed in Freeform 6.0
         */
        $event->rules[] = new UrlRule([
            'pattern' => 'freeform/oauth/authorize',
            'route' => 'freeform/oauth2-auth/firewall-callback',
            'verb' => ['GET'],
        ]);

        $event->rules[] = new UrlRule([
            'pattern' => 'freeform/integrations/<id:\d+>/oauth2/authorize',
            'route' => 'freeform/oauth2-auth/authorize',
            'verb' => ['GET'],
        ]);
    }

    public function registerRoutes(RegisterUrlRulesEvent $event): void
    {
        $event->rules[] = new UrlRule([
            'pattern' => 'freeform/oauth/callback',
            'route' => 'freeform/oauth2-auth/callback',
            'verb' => ['GET'],
        ]);
    }
}
