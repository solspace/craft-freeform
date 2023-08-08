<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM\Zoho;

use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BaseZohoIntegration extends CRMIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, ZohoIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'Zoho';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected ?string $apiDomain = null;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected ?string $accountsServer = null;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected ?string $location = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'Enable this if your Zoho account is in Sandbox mode (connects to "sandbox.zohoapis.{domain}" instead of "www.zohoapis.com" or "www.zohoapis.{domain}").',
        order: 1,
    )]
    protected bool $sandboxMode = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'Enable this if your Zoho account is in Developer mode (connects to "developer.zohoapis.{domain}" instead of "www.zohoapis.com", "www.zohoapis.{domain}" or "sandbox.zohoapis.{domain}").',
        order: 2,
    )]
    protected bool $developerMode = false;

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/settings/modules'));
            $json = json_decode((string) $response->getBody(), false);

            return !empty($json);
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(string $category, Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/settings/fields?module='.$category.'s'));
        } catch (\Exception $exception) {
            $this->processException($exception);
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->fields) || !$json->fields) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        foreach ($json->fields as $field) {
            if ($field->read_only || $field->field_read_only) {
                continue;
            }

            switch ($field->data_type) {
                case 'boolean':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'list':
                case 'picklist':
                case 'multiselectpicklist':
                    if ('jsonobject' === $field->json_type || 'jsonarray' === $field->json_type) {
                        $type = FieldObject::TYPE_ARRAY;
                    } else {
                        $type = FieldObject::TYPE_STRING;
                    }

                    break;

                case 'integer':
                case 'number':
                case 'bigint':
                case 'currency':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;

                case 'double':
                case 'decimal':
                    $type = FieldObject::TYPE_FLOAT;

                    break;

                case 'date':
                    $type = FieldObject::TYPE_DATE;

                    break;

                case 'timestamp':
                case 'datetime':
                    $type = FieldObject::TYPE_DATETIME;

                    break;

                default:
                    $type = FieldObject::TYPE_STRING;
            }

            $fieldList[] = new FieldObject(
                $field->api_name,
                $field->field_label,
                $type,
                $category,
                $field->system_mandatory,
            );
        }

        return $fieldList;
    }

    public function getApiDomain(): ?string
    {
        return $this->apiDomain;
    }

    public function setApiDomain(?string $apiDomain): self
    {
        $this->apiDomain = $apiDomain;

        return $this;
    }

    public function getAccountsServer(): ?string
    {
        return $this->accountsServer;
    }

    public function setAccountsServer(?string $accountsServer): self
    {
        $this->accountsServer = $accountsServer;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): self
    {
        $this->location = $location;

        return $this;
    }

    protected function isSandboxMode(): bool
    {
        return $this->sandboxMode;
    }

    protected function isDeveloperMode(): bool
    {
        return $this->developerMode;
    }

    protected function getDomain(): string
    {
        $domain = 'https://accounts.zoho.com';

        $accountsServer = $this->getAccountsServer();
        if ($accountsServer) {
            $domain = $accountsServer;
        }

        return rtrim($domain, '/');
    }

    protected function getLogger(?string $category = null): LoggerInterface
    {
        return parent::getLogger($category ?? self::LOG_CATEGORY);
    }

    protected function processZohoResponseError(array $response): void
    {
        $data = $response['data'][0];
        if ('error' === $data['status']) {
            $this->getLogger()->error(
                $data['message'],
                ['exception' => $data],
            );

            throw new IntegrationException($data['message']);
        }
    }
}
