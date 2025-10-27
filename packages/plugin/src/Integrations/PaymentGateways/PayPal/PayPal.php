<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
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

    // Token management properties (stored in metadata)
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $accessToken = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $issuedAt = 0;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $expiresIn = 0;

    public function getClientId(): string
    {
        return $this->getProcessedValue($this->clientId);
    }

    public function getClientSecret(): string
    {
        return $this->getProcessedValue($this->clientSecret);
    }

    public function isSandbox(): bool
    {
        return $this->useSandbox;
    }

    // Token management methods
    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function setAccessToken(string $accessToken): self
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    public function getIssuedAt(): int
    {
        return $this->issuedAt;
    }

    public function setIssuedAt(int $issuedAt): self
    {
        $this->issuedAt = $issuedAt;

        return $this;
    }

    public function getExpiresIn(): int
    {
        return $this->expiresIn;
    }

    public function setExpiresIn(int $expiresIn): self
    {
        $this->expiresIn = $expiresIn;

        return $this;
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->post($this->getApiRootUrl().'/v1/oauth2/token', [
            'auth' => [$this->getClientId(), $this->getClientSecret()],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ]);

        return 200 === $response->getStatusCode();
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
}
