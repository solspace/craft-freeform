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

        $endpoint = $integration->getApiRootUrl().'/v2/checkout/orders/'.$orderId.'/capture';

        try {
            $response = $client->post($endpoint);

            $json = json_decode((string) $response->getBody());

            return [
                'status' => (string) ($json->status ?? ''),
                'id' => (string) ($json->id ?? $orderId),
            ];
        } catch (\Throwable $e) {
            throw $e;
        }
    }
}
