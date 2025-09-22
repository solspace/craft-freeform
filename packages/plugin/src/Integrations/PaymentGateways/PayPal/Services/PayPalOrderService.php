<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\Services;

use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\Fields\PayPalField;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;

class PayPalOrderService
{
    public function __construct(
        private IntegrationClientProvider $clientProvider,
        private IntegrationLoggerProvider $loggerProvider,
    ) {}

    public function createOrder(Form $form, PayPal $integration, PayPalField $field, string $description, string $hash, int $amount, string $currency): array
    {
        try {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $token = $this->fetchAccessToken($client, $integration);

            $endpoint = $integration->getApiRootUrl().'/v2/checkout/orders';

            $payload = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($amount / 100, 2, '.', ''),
                    ],
                    'description' => $description,
                    'custom_id' => $hash,
                ]],
                'application_context' => [
                    'user_action' => 'PAY_NOW',
                ],
            ];

            $response = $client->post($endpoint, [
                RequestOptions::HEADERS => [
                    'Authorization' => 'Bearer '.$token,
                    'Content-Type' => 'application/json',
                ],
                RequestOptions::JSON => $payload,
            ]);

            $json = json_decode($response->getBody()->getContents());

            $links = $json->links ?? [];
            $approve = null;
            foreach ($links as $l) {
                if (($l->rel ?? '') === 'approve') {
                    $approve = $l->href ?? null;

                    break;
                }
            }

            return [
                'id' => (string) $json->id,
                'status' => (string) $json->status,
                'approve' => $approve,
            ];
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    public function captureOrder(Form $form, PayPal $integration, PayPalField $field, string $orderId, ?array $overrideValues = null): array
    {
        try {
            $client = $this->clientProvider->getAuthorizedClient($integration);
        } catch (\Exception $e) {
            throw $e;
        }

        try {
            $token = $this->fetchAccessToken($client, $integration);
        } catch (\Exception $e) {
            throw $e;
        }

        $endpoint = $integration->getApiRootUrl().'/v2/checkout/orders/'.$orderId.'/capture';

        try {
            $response = $client->post($endpoint, [
                RequestOptions::HEADERS => [
                    'Authorization' => 'Bearer '.$token,
                    'Content-Type' => 'application/json',
                ],
            ]);

            $json = json_decode((string) $response->getBody());

            return [
                'status' => (string) ($json->status ?? ''),
                'id' => (string) ($json->id ?? $orderId),
            ];
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    private function fetchAccessToken($client, PayPal $integration): string
    {
        $clientId = $integration->getClientId();
        $clientSecret = $integration->getClientSecret();

        if (!$clientId || !$clientSecret) {
            throw new \Exception('PayPal credentials are not set correctly. Client ID: '.($clientId ? 'set' : 'not set').', Client Secret: '.($clientSecret ? 'set' : 'not set'));
        }

        $endpoint = $integration->getApiRootUrl().'/v1/oauth2/token';

        try {
            $response = $client->post($endpoint, [
                'auth' => [$clientId, $clientSecret],
                'headers' => [
                    'Accept' => 'application/json',
                    'Accept-Language' => 'en_US',
                ],
                'form_params' => [
                    'grant_type' => 'client_credentials',
                ],
            ]);

            $json = json_decode($response->getBody()->getContents());

            return (string) ($json->access_token ?? '');
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
