<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'PayPal',
    type: Type::TYPE_PAYMENT_GATEWAYS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class PayPal extends PaymentGatewayIntegration
{
    public const LOG_CATEGORY = 'PayPal';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Enter your PayPal REST app client ID.',
    )]
    protected string $clientId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client Secret',
        instructions: 'Enter your PayPal REST app client secret.',
    )]
    protected string $clientSecret = '';

    #[Input\Boolean(
        label: 'Use Sandbox',
        instructions: 'Enable to use PayPal Sandbox environment.',
    )]
    protected bool $useSandbox = true;

    public function getClientId(): ?string
    {
        return $this->getProcessedValue($this->clientId);
    }

    public function getClientSecret(): ?string
    {
        return $this->getProcessedValue($this->clientSecret);
    }

    public function isSandbox(): bool
    {
        return (bool) $this->useSandbox;
    }

    public function checkConnection(Client $client): bool
    {
        $token = $this->fetchAccessToken($client);

        return !empty($token);
    }

    public function getApiRootUrl(): string
    {
        if ($this->isSandbox()) {
            return 'https://api-m.sandbox.paypal.com';
        }

        return 'https://api-m.paypal.com';
    }

    protected function getProcessableFields(string $category): array
    {
        // No field mapping defined yet for PayPal; return empty map
        return [];
    }

    private function fetchAccessToken(Client $client): string
    {
        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        if (!$clientId || !$clientSecret) {
            throw new IntegrationException('PayPal credentials are not set correctly.');
        }

        $endpoint = $this->getEndpoint('/v1/oauth2/token');

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

        [, $json] = $this->getJsonResponse($response);

        return (string) ($json->access_token ?? '');
    }
}
