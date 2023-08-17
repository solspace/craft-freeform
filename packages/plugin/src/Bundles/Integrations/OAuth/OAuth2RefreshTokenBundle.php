<?php

namespace Solspace\Freeform\Bundles\Integrations\OAuth;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Events\Integrations\OAuth2\TokenPayloadEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use yii\base\Event;

class OAuth2RefreshTokenBundle extends FeatureBundle
{
    private const DEFAULT_TOKEN_DURATION = 3600;

    private static array $refreshedTokens = [];

    public function __construct()
    {
        Event::on(
            OAuth2ConnectorInterface::class,
            OAuth2ConnectorInterface::EVENT_AFTER_AUTHORIZE,
            [$this, 'onFetchTokens']
        );

        Event::on(
            OAuth2RefreshTokenInterface::class,
            OAuth2RefreshTokenInterface::EVENT_AFTER_REFRESH,
            [$this, 'onAfterRefresh']
        );

        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'refreshTokens']
        );
    }

    public static function getPriority(): int
    {
        return 1500;
    }

    public function onFetchTokens(TokenPayloadEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2RefreshTokenInterface) {
            return;
        }

        $payload = $event->getResponsePayload();
        if (!isset($payload->refresh_token)) {
            throw new IntegrationException(
                Freeform::t(
                    "No 'refresh_token' present in auth response for {serviceProvider}. Enable offline-access for your app.",
                    ['serviceProvider' => $integration->getServiceProvider()]
                )
            );
        }

        $integration->setRefreshToken($payload->refresh_token);
        $integration->setIssuedAt(time());
        $integration->setExpiresIn($payload->expires_in ?? self::DEFAULT_TOKEN_DURATION);
    }

    public function onAfterRefresh(TokenPayloadEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2RefreshTokenInterface) {
            return;
        }

        $payload = $event->getResponsePayload();
        if (!isset($payload->access_token)) {
            throw new IntegrationException(
                Freeform::t(
                    "No 'access_token' present in refresh token response for {serviceProvider}.",
                    ['serviceProvider' => $integration->getServiceProvider()]
                )
            );
        }

        $integration->setAccessToken($payload->access_token);
        $integration->setIssuedAt(time());
        $integration->setExpiresIn($payload->expires_in ?? self::DEFAULT_TOKEN_DURATION);
    }

    public function refreshTokens(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof OAuth2RefreshTokenInterface) {
            return;
        }

        $issuedAt = $integration->getIssuedAt();
        $expiresIn = $integration->getExpiresIn();

        if ($issuedAt + $expiresIn >= time()) {
            return;
        }

        if (\in_array($integration->getId(), self::$refreshedTokens, true)) {
            return;
        }

        $clientId = $integration->getClientId();
        $clientSecret = $integration->getClientSecret();
        $refreshToken = $integration->getRefreshToken();

        if (!$clientId || !$clientSecret || !$refreshToken) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client();

        $payload = [
            'refresh_token' => $refreshToken,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token',
        ];

        try {
            $response = $client->post($integration->getAccessTokenUrl(), ['form_params' => $payload]);
            $responsePayload = json_decode($response->getBody(), false);

            Event::trigger(
                OAuth2RefreshTokenInterface::class,
                OAuth2RefreshTokenInterface::EVENT_AFTER_REFRESH,
                new TokenPayloadEvent($integration, $responsePayload)
            );

            self::$refreshedTokens[] = $integration->getId();

            $integrationsService = Freeform::getInstance()->integrations;
            $model = $integrationsService->getById($integration->getId());
            $integrationsService->save($model, $integration);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            Freeform::$logger
                ->getLogger('Integrations')
                ->error($responseBody, ['exception' => $e->getMessage()])
            ;

            throw $e;
        }
    }
}
