<?php

namespace Solspace\Freeform\Integrations\CRM\Zoho;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;

abstract class BaseZohoIntegration extends CRMOAuthConnector implements RefreshTokenInterface
{
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $domain = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $apiDomain = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $accountsServer = '';

    abstract public function getModule(): string;

    /**
     * A method that initiates the authentication.
     */
    public function initiateAuthentication(): void
    {
        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $redirectUri = $this->getReturnUri();

        if (!$clientId || !$clientSecret) {
            return;
        }

        $payload = [
            'scope' => 'ZohoCRM.modules.READ,ZohoCRM.modules.CREATE,ZohoCRM.modules.ALL,ZohoCRM.settings.all',
            'client_id' => $clientId,
            'response_type' => 'code',
            'access_type' => 'offline',
            'redirect_uri' => $redirectUri,
        ];

        header('Location: '.$this->getAuthorizeUrl().'?'.http_build_query($payload));

        exit;
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(bool $refreshTokenIfExpired = true): bool
    {
        $client = $this->generateAuthorizedClient($refreshTokenIfExpired);
        $endpoint = $this->getEndpoint('/'.$this->getModule());

        $response = $client->get($endpoint);

        return $response->getStatusCode() >= 200 && $response->getStatusCode() < 300;
    }

    /**
     * Returns the API root url without endpoints specified.
     */
    public function getApiRootUrl(): string
    {
        $url = $this->apiDomain ?? 'https://www.zohoapis.com';
        $url = rtrim($url, '/');

        return "{$url}/crm/v2";
    }

    protected function onBeforeFetchAccessToken(&$payload): void
    {
        $this->domain = $_GET['location'] ?? '';
        $this->accountsServer = $_GET['accounts-server'] ?? '';
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    protected function getAuthorizeUrl(): string
    {
        return 'https://accounts.zoho.com/oauth/v2/auth';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    protected function getAccessTokenUrl(): string
    {
        $url = $this->accountsServer ?? 'https://accounts.zoho.com';
        $url = rtrim($url, '/');

        return "{$url}/oauth/v2/token";
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
        if (isset($responseData->api_domain)) {
            $this->apiDomain = $responseData->api_domain;
        }
    }

    protected function convertFieldType(string $fieldType, string $jsonType): string
    {
        switch ($fieldType) {
            case 'boolean':
                $type = FieldObject::TYPE_BOOLEAN;

                break;

            case 'list':
            case 'picklist':
            case 'multiselectpicklist':
                if ('jsonobject' == $jsonType || 'jsonarray' == $jsonType) {
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

                break;
        }

        return $type;
    }
}
