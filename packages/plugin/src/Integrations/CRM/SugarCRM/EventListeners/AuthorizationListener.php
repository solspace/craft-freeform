<?php

namespace Solspace\Freeform\Integrations\CRM\SugarCRM\EventListeners;

use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\CRM\SugarCRM\SugarCRM;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class AuthorizationListener extends FeatureBundle
{
    public const CHECK_BUFFER = 120; // 2-minutes

    public function __construct(
        private IntegrationsService $integrationsService,
    ) {
        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZE,
            [$this, 'onAuthorize'],
        );

        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'configureClient']
        );

        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'refreshIfExpired']
        );

        Event::on(
            IntegrationInterface::class,
            IntegrationInterface::EVENT_ON_FAILED_REQUEST,
            [$this, 'forceRefresh']
        );
    }

    public function onAuthorize(AuthorizeIntegrationEvent $event): void
    {
        $integration = $event->getIntegration();
        $model = $event->getModel();
        if (!$integration instanceof SugarCRM) {
            return;
        }

        $payload = [
            'grant_type' => 'password',
            'client_id' => 'sugar',
            'client_secret' => '',
            'username' => $integration->getUsername(),
            'password' => $integration->getPassword(),
            'platform' => 'freeform',
        ];

        $client = \Craft::createGuzzleClient();
        $response = $client->post(
            $integration->getAccessTokenUrl(),
            [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => $payload,
            ]
        );

        $json = json_decode((string) $response->getBody(), true);

        $accessToken = $json['access_token'];
        $refreshToken = $json['refresh_token'];
        $expiresIn = $json['expires_in'];
        $scope = $json['scope'];
        $downloadToken = $json['download_token'];

        $integration->setAccessToken($accessToken);
        $integration->setRefreshToken($refreshToken);
        $integration->setIssuedAt(time());
        $integration->setExpiresIn($expiresIn);
        $integration->setDownloadToken($downloadToken);
        $integration->setScope($scope);

        $model->connectionEstablished = true;

        $this->integrationsService->save($model, $integration);
    }

    public function configureClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof SugarCRM) {
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

    public function refreshIfExpired(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof SugarCRM) {
            return;
        }

        $issuedAt = $integration->getIssuedAt();
        $expiresIn = $integration->getExpiresIn();

        if ($issuedAt + $expiresIn - self::CHECK_BUFFER > time()) {
            return;
        }

        $this->refreshToken($integration);
    }

    public function forceRefresh(FailedRequestEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $integration = $event->getIntegration();
        if (!$integration instanceof SugarCRM) {
            return;
        }

        $exception = $event->getException();
        if (401 !== $exception->getCode()) {
            return;
        }

        $this->refreshToken($integration);
        $event->triggerRetry();
    }

    private function refreshToken(SugarCRM $integration): void
    {
        $refreshToken = $integration->getRefreshToken();
        if (!$refreshToken) {
            throw new IntegrationException('Refresh token is missing');
        }

        $client = \Craft::createGuzzleClient();

        $payload = [
            'refresh_token' => $refreshToken,
            'client_id' => 'sugar',
            'client_secret' => '',
            'grant_type' => 'refresh_token',
        ];

        try {
            $response = $client->post($integration->getAccessTokenUrl(), ['form_params' => $payload]);
            $json = json_decode($response->getBody(), false);

            $integration->setAccessToken($json->access_token);
            $integration->setRefreshToken($json->refresh_token);
            $integration->setDownloadToken($json->download_token);
            $integration->setIssuedAt(time());
            $integration->setExpiresIn($json->expires_in);

            $integrationsService = Freeform::getInstance()->integrations;
            $model = $integrationsService->getById($integration->getId());
            $integrationsService->save($model, $integration);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();

            Freeform::getInstance()->logger->getLogger(FreeformLogger::INTEGRATION)->error($responseBody, ['exception' => $e->getMessage()]);
        }
    }
}
