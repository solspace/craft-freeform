<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Square;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Square',
    type: Type::TYPE_PAYMENT_GATEWAYS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Square extends PaymentGatewayIntegration
{
    public const LOG_CATEGORY = 'Square';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Application ID',
        instructions: 'Your Square Application ID (used by the Web Payments SDK).',
    )]
    protected string $applicationId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Access Token',
        instructions: 'Square access token for server-side API calls. Use a sandbox token when sandbox is enabled.',
    )]
    protected string $accessToken = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Location ID',
        instructions: 'Square Location ID where payments will be taken.',
    )]
    protected string $locationId = '';

    #[Input\Boolean(
        label: 'Use Sandbox',
        instructions: 'Enable to use Square Sandbox environment.',
    )]
    protected bool $useSandbox = true;

    public function getApplicationId(): string
    {
        return $this->getProcessedValue($this->applicationId);
    }

    public function getAccessToken(): string
    {
        return $this->getProcessedValue($this->accessToken);
    }

    public function getLocationId(): string
    {
        return $this->getProcessedValue($this->locationId);
    }

    public function isUseSandbox(): bool
    {
        return (bool) $this->getProcessedValue($this->useSandbox);
    }

    public function getApiRootUrl(): string
    {
        return $this->isUseSandbox()
            ? 'https://connect.squareupsandbox.com'
            : 'https://connect.squareup.com';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getApiRootUrl().'/v2/locations', [
            RequestOptions::HEADERS => [
                'Authorization' => 'Bearer '.$this->getAccessToken(),
                'Content-Type' => 'application/json',
            ],
        ]);

        return 200 === $response->getStatusCode();
    }

    protected function getProcessableFields(string $category): array
    {
        // No field mapping for Square at this time
        return [];
    }
}
