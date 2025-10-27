<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\Mollie;

use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use Mollie\Api\MollieApiClient;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Integrations\PaymentGateways\Mollie\Properties\WebhookUrlGenerator;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\Types\PaymentGateways\PaymentGatewayIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Mollie',
    type: Type::TYPE_PAYMENT_GATEWAYS,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Mollie extends PaymentGatewayIntegration
{
    public const LOG_CATEGORY = 'Mollie';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your Mollie API key here. You can find this in your Mollie Dashboard under Developers → API keys.',
    )]
    protected string $apiKey = '';

    #[Input\Boolean(
        label: 'Use Test Mode',
        instructions: 'Enable to use Mollie test mode. Make sure to use your test API key when this is enabled.',
    )]
    protected bool $useTestMode = true;

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Webhook Secret',
        instructions: 'Enter your Mollie webhook secret here for secure webhook verification.',
    )]
    protected string $webhookSecret = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_READONLY)]
    #[ValueGenerator(WebhookUrlGenerator::class)]
    #[Input\Text(
        label: 'Webhook URL',
        instructions: 'Use this URL when configuring your Mollie webhook in the Mollie Dashboard.',
    )]
    protected string $webhookUrl = '';

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function isTestMode(): bool
    {
        return $this->useTestMode;
    }

    public function getWebhookSecret(): string
    {
        return $this->getProcessedValue($this->webhookSecret);
    }

    public function getWebhookUrl(): string
    {
        if (!empty($this->webhookUrl)) {
            return $this->webhookUrl;
        }

        return UrlHelper::siteUrl('freeform/payments/mollie/webhook');
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $mollie = $this->getMollieClient();
            $methods = $mollie->methods->all();

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getMollieClient(): MollieApiClient
    {
        static $clients = [];
        if (!isset($clients[$this->getId()])) {
            $apiKey = $this->getApiKey();
            if (empty($apiKey)) {
                throw new IntegrationException('Mollie API key is not set correctly.');
            }

            $clients[$this->getId()] = new MollieApiClient();
            $clients[$this->getId()]->setApiKey($apiKey);
        }

        return $clients[$this->getId()];
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.mollie.com/v2';
    }

    protected function getProcessableFields(string $category): array
    {
        return [];
    }
}
