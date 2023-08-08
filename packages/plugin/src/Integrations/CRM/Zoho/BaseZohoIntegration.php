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
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
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

    // TODO - WHERE TO ADD THIS IMPORTANT NOTE ?
    // If your application has more than one environment, the access and refresh token generated for a user becomes organization-specific in an environment. Thus, you cannot use tokens generated for an organization in one environment to make API calls to the organization in another environment. For instance, you cannot use tokens generated for an organization in the Production environment to make API calls to the organizations in the sandbox or developer accounts.

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $apiDomain = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected ?string $accountsServer = null;

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

    protected function getApiDomain(): string
    {
        return $this->apiDomain;
    }

    protected function isSandboxMode(): bool
    {
        return $this->sandboxMode;
    }

    protected function isDeveloperMode(): bool
    {
        return $this->developerMode;
    }

    protected function getAccountsServer(): ?string
    {
        return $this->accountsServer;
    }

    protected function onAuthentication(array &$payload): void
    {
        $payload['response_type'] = 'code';
        $payload['access_type'] = 'offline';
        $payload['client_id'] = $this->getClientId();
        $payload['redirect_uri'] = $this->getReturnUri();
        $payload['scope'] = 'ZohoCRM.modules.READ,ZohoCRM.modules.CREATE,ZohoCRM.modules.ALL,ZohoCRM.settings.all';
    }

    protected function onBeforeFetchAccessToken(&$payload): void
    {
        // TODO: refactor this to go through the after fetched tokens event
        $this->accountsServer = $_GET['accounts-server'] ?? '';
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
        if (!isset($responseData->api_domain)) {
            throw new CRMIntegrationNotFoundException("Zohos response data doesn't contain the API Domain");
        }

        $this->apiDomain = $responseData->api_domain;
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
}
