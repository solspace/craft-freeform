<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use craft\web\UrlRule;
use Solspace\Freeform\Bundles\Integrations\OAuth\Controllers\OAuth2AuthController;
use Solspace\Freeform\Bundles\Integrations\OAuth\Providers\OAuth2StateProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use yii\base\Event;

class OAuth2Bundle extends FeatureBundle
{
    public function __construct(
        private OAuth2StateProvider $stateProvider,
    ) {
        $this->registerController('oauth2-auth', OAuth2AuthController::class);

        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
            [$this, 'onAuthorize'],
        );

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

    public function onAuthorize(AuthorizeIntegrationEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            return;
        }

        $token = CryptoHelper::getUniqueToken(6);

        $payload = [
            'response_type' => 'code',
            'client_id' => $integration->getClientId(),
            'redirect_uri' => $integration->getRedirectUri(),
            'state' => $this->stateProvider->encryptState($integration->getId(), $token),
        ];

        $event = new InitiateAuthenticationFlowEvent($integration, $payload);
        Event::trigger(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_INITIATE_AUTHENTICATION_FLOW,
            $event
        );

        $queryString = http_build_query($event->getPayload());

        header('Location: '.$integration->getAuthorizeUrl().'?'.$queryString);

        exit;
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

        // FIXME - Do we need to call AuthorizeIntegrationEvent here?
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
            'route' => 'freeform/oauth2-auth/callback',
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
