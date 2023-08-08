<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\InitiateAuthenticationFlowEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Events\Integrations\SaveEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class OAuth2Bundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_AFTER_SAVE,
            [$this, 'onSave']
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
    }

    public function onSave(SaveEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2ConnectorInterface) {
            return;
        }

        $this->initiateAuthenticationFlow($integration);
    }

    #[NoReturn]
    public function initiateAuthenticationFlow(OAuth2ConnectorInterface $integration): void
    {
        $payload = [
            'response_type' => 'code',
            'client_id' => $integration->getClientId(),
            'redirect_uri' => $integration->getRedirectUri(),
            'state' => $integration->getId(),
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
}
