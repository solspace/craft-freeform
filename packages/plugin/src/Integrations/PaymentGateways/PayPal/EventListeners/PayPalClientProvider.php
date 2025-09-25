<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Events\Integrations\GetAuthorizedClientEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use yii\base\Event;

class PayPalClientProvider
{
    public function __construct()
    {
        Event::on(
            IntegrationClientProvider::class,
            IntegrationClientProvider::EVENT_GET_CLIENT,
            [$this, 'handleGetAuthorizedClient']
        );
    }

    public function handleGetAuthorizedClient(GetAuthorizedClientEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof PayPal) {
            return;
        }

        $clientId = $integration->getClientId();
        $clientSecret = $integration->getClientSecret();

        if (!$clientId || !$clientSecret) {
            return;
        }

        // Check if we have a valid cached token
        $accessToken = $integration->getAccessToken();
        $issuedAt = $integration->getIssuedAt();
        $expiresIn = $integration->getExpiresIn();

        // Check if token is expired (with 1 minute buffer)
        $isExpired = !$accessToken || !$issuedAt || !$expiresIn || (time() >= ($issuedAt + $expiresIn - 60));

        if (!$isExpired) {
            // Use cached token
            $event->addConfig([
                'base_uri' => $integration->getApiRootUrl(),
                RequestOptions::HEADERS => [
                    'Authorization' => 'Bearer '.$accessToken,
                    'Content-Type' => 'application/json',
                ],
            ]);

            return;
        }

        // Fetch new token
        try {
            $token = $this->fetchAccessToken($integration);
            if ($token) {
                // Update the integration object with the new token data
                $integration->setAccessToken($token['access_token']);
                $integration->setIssuedAt(time());
                $integration->setExpiresIn($token['expires_in'] ?? 3600);

                // Save the integration to persist the token
                $integrationModel = Freeform::getInstance()->integrations->getById($integration->getId());
                if ($integrationModel) {
                    Freeform::getInstance()->integrations->save($integrationModel, $integration);
                }

                $event->addConfig([
                    'base_uri' => $integration->getApiRootUrl(),
                    RequestOptions::HEADERS => [
                        'Authorization' => 'Bearer '.$token['access_token'],
                        'Content-Type' => 'application/json',
                    ],
                ]);
            }
        } catch (\Exception $e) {
            // Token fetch failed, fall back to basic auth
            $event->addConfig([
                'base_uri' => $integration->getApiRootUrl(),
                RequestOptions::HEADERS => [
                    'Content-Type' => 'application/json',
                ],
                'auth' => [$clientId, $clientSecret],
            ]);
        }
    }

    private function fetchAccessToken(PayPal $integration): array
    {
        $client = \Craft::createGuzzleClient();

        $response = $client->post($integration->getApiRootUrl().'/v1/oauth2/token', [
            'auth' => [$integration->getClientId(), $integration->getClientSecret()],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);

        if (!$data || !isset($data['access_token'])) {
            throw new \Exception('Failed to fetch PayPal access token');
        }

        return $data;
    }
}
