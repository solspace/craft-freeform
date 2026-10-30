<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2IssuedAtMilliseconds;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2PKCEInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\OAuth\ReturnURLValueGenerator;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BaseSalesforceIntegration extends CRMIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, SalesforceIntegrationInterface, OAuth2PKCEInterface, OAuth2IssuedAtMilliseconds
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'Salesforce';

    protected const CATEGORY_LEAD = 'Lead';
    protected const CATEGORY_OPPORTUNITY = 'Opportunity';
    protected const CATEGORY_ACCOUNT = 'Account';
    protected const CATEGORY_CONTACT = 'Contact';
    protected const CATEGORY_CASE = 'Case';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $instanceUrl = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_READONLY)]
    #[ValueGenerator(ReturnURLValueGenerator::class)]
    #[Input\Text(
        label: 'OAuth Callback URL',
        instructions: 'Copy this URL into the Callback URL field in your Salesforce app. It must match exactly.',
        order: 10,
    )]
    protected string $redirectUri = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Copy the consumer key from your Salesforce app.',
        order: 20,
    )]
    protected string $clientId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client Secret',
        instructions: 'Copy the consumer secret from your Salesforce app. This stays on your server.',
        order: 30,
    )]
    protected string $clientSecret = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Salesforce login options',
        instructions: 'Sandbox and custom domain settings. Most connections use the defaults.',
        order: 90,
    )]
    protected bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\BooleanEnv(
        label: 'Use custom Salesforce login URL',
        instructions: 'Enable if your Salesforce organization requires its own My Domain login URL.',
        order: 110,
    )]
    protected string $useCustomUrl = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Salesforce login URL',
        instructions: 'Only used when custom login is enabled. Enter the full URL, such as `https://mycompany.my.salesforce.com`. This takes priority over sandbox login.',
        order: 120,
    )]
    protected ?string $customUrl = null;

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\BooleanEnv(
        label: 'Use Salesforce sandbox login',
        instructions: 'Use `test.salesforce.com` for Salesforce authorization. This changes the login server only.',
        order: 100,
    )]
    protected string $sandboxMode = 'false';

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/'));

        $json = json_decode((string) $response->getBody(), false);

        return !empty($json);
    }

    public function getAuthorizeUrl(): string
    {
        return $this->getDomain().'/services/oauth2/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return $this->getDomain().'/services/oauth2/token';
    }

    public function getInstanceUrl(): string
    {
        return $this->instanceUrl;
    }

    public function setInstanceUrl(string $instanceUrl): self
    {
        $this->instanceUrl = $instanceUrl;

        return $this;
    }

    public function fetchFields(string $category, Client $client): array
    {
        $response = $client->get($this->getEndpoint('/sobjects/'.$category.'/describe'));
        $json = json_decode((string) $response->getBody());

        if (!isset($json->fields) || !$json->fields) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        $isCase = self::CATEGORY_CASE === $category;
        foreach ($json->fields as $field) {
            if (!($isCase ? $field->createable : $field->updateable)) {
                continue;
            }

            $options = null;
            foreach ($field->picklistValues ?? [] as $picklistValue) {
                if ($isCase && !($picklistValue->active ?? true)) {
                    continue;
                }

                $options[] = [
                    'key' => $picklistValue->value,
                    'label' => $picklistValue->label,
                ];
            }

            $type = match ($field->type) {
                'string', 'encryptedstring', 'textarea', 'email', 'url', 'address', 'picklist', 'phone', 'reference' => FieldObject::TYPE_STRING,
                'int', 'number', 'currency' => FieldObject::TYPE_NUMERIC,
                'boolean' => FieldObject::TYPE_BOOLEAN,
                'multipicklist' => FieldObject::TYPE_ARRAY,
                'double' => FieldObject::TYPE_FLOAT,
                'date' => FieldObject::TYPE_DATE,
                'datetime' => FieldObject::TYPE_DATETIME,
                default => null,
            };

            if (null === $type) {
                continue;
            }

            $fieldList[] = new FieldObject(
                $field->name,
                $field->label,
                $type,
                $category,
                !$field->nillable && (!$isCase || !($field->defaultedOnCreate ?? false)),
                $options,
            );
        }

        return $fieldList;
    }

    protected function isCustomUrl(): bool
    {
        return $this->getProcessedBoolean($this->useCustomUrl);
    }

    protected function getCustomUrl(): ?string
    {
        return rtrim(trim((string) $this->getProcessedValue($this->customUrl)), '/') ?: null;
    }

    protected function isSandboxMode(): bool
    {
        return $this->getProcessedBoolean($this->sandboxMode);
    }

    protected function getDomain(): string
    {
        $domain = 'https://login.salesforce.com';

        if ($this->isSandboxMode()) {
            $domain = 'https://test.salesforce.com';
        }

        if ($this->isCustomUrl()) {
            $domain = $this->getCustomUrl();
        }

        return $domain;
    }

    protected function query(Client $client, string $query, array $params = [], bool $escapeParams = true): array
    {
        if ($escapeParams) {
            $params = array_map([$this, 'soqlEscape'], $params);
        }

        $query = \sprintf($query, ...$params);

        $response = $client->get(
            $this->getEndpoint('/query'),
            [
                'query' => [
                    'q' => $query,
                ],
            ]
        );

        $result = json_decode($response->getBody());

        $this->logger->debug('Querying Salesforce', ['query' => $query, 'results' => $result]);

        if (0 === $result->totalSize || !$result->done) {
            return [];
        }

        return $result->records;
    }

    protected function querySingle(Client $client, string $query, array $params = []): mixed
    {
        $data = $this->query($client, $query, $params);

        if (\count($data) >= 1) {
            return reset($data);
        }

        return null;
    }

    protected function soqlEscape(array|string $str = ''): string
    {
        if (\is_array($str)) {
            return implode(',', array_map([$this, 'soqlEscape'], $str));
        }

        $characters = [
            '\\',
            '\'',
        ];
        $replacement = [
            '\\\\',
            '\\\'',
        ];

        return str_replace($characters, $replacement, $str);
    }
}
