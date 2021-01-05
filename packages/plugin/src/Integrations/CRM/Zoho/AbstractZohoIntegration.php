<?php

namespace Solspace\Freeform\Integrations\CRM\Zoho;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\CRMOAuthConnector;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

abstract class AbstractZohoIntegration extends CRMOAuthConnector
{
    const SETTING_REFRESH_TOKEN = 'refresh_token';
    const SETTING_DOMAIN = 'domain';
    const SETTING_API_DOMAIN = 'api_domain';
    const SETTING_ACCOUNTS_SERVER = 'accounts_server';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens.
     *
     * @return SettingBlueprint[]
     */
    public static function getSettingBlueprints(): array
    {
        return [
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_RETURN_URI,
                'OAuth 2.0 Return URI',
                'You must specify this as the Return URI in your app settings to be able to authorize your credentials. DO NOT CHANGE THIS.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_CLIENT_ID,
                'Client ID',
                'Enter the Client ID of your app in here',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_CLIENT_SECRET,
                'Client Secret',
                'Enter the Client Secret of your app here',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_REFRESH_TOKEN,
                'Refresh Token',
                'You should not set this',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_DOMAIN,
                'Domain',
                'The domain suffix'
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_API_DOMAIN,
                'API Domain',
                'The domain used for performing API requests'
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_ACCOUNTS_SERVER,
                'API Domain',
                'The domain used for performing API requests'
            ),
        ];
    }

    abstract public function getModule(): string;

    /**
     * A method that initiates the authentication.
     */
    public function initiateAuthentication()
    {
        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $redirectUri = $this->getReturnUri();

        if (!$clientId || !$clientSecret) {
            return false;
        }

        $payload = [
            'scope' => 'ZohoCRM.modules.READ,ZohoCRM.modules.CREATE,ZohoCRM.modules.ALL,ZohoCRM.settings.all',
            'client_id' => $clientId,
            'response_type' => 'code',
            'access_type' => 'offline',
            'redirect_uri' => $redirectUri,
        ];

        header('Location: '.$this->getAuthorizeUrl().'?'.http_build_query($payload));

        exit();
    }

    /**
     * Authorizes the application
     * Returns the access_token.
     *
     * @throws IntegrationException
     * @throws \Exception
     */
    public function fetchAccessToken(): string
    {
        $code = $_GET['code'] ?? null;
        $location = $_GET['location'] ?? null;
        $accountsServer = $_GET['accounts-server'] ?? null;

        $this->setSetting(self::SETTING_DOMAIN, $location);
        $this->setSetting(self::SETTING_ACCOUNTS_SERVER, $accountsServer);

        $this->onBeforeFetchAccessToken($code);

        if (null === $code) {
            return '';
        }

        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $redirectUri = $this->getReturnUri();

        if (!$clientId || !$clientSecret || !$redirectUri) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client();

        $payload = [
            'grant_type' => 'authorization_code',
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'code' => $code,
        ];

        try {
            $response = $client->post(
                $this->getAccessTokenUrl(),
                ['form_params' => $payload]
            );

            $json = \GuzzleHttp\json_decode($response->getBody(), false);

            if (!isset($json->access_token)) {
                throw new IntegrationException(
                    $this->getTranslator()->translate(
                        "No 'access_token' present in auth response for {serviceProvider}",
                        ['serviceProvider' => $this->getServiceProvider()]
                    )
                );
            }

            $this->setAccessToken($json->access_token);
            $this->setAccessTokenUpdated(true);

            $this->onAfterFetchAccessToken($json);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw $e;
        }

        return $this->getAccessToken();
    }

    /**
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $refreshToken = $this->getRefreshToken();

        if (!$clientId || !$clientSecret || !$refreshToken) {
            return;
        }

        $this->fetchAccessToken();
        $model->updateAccessToken($this->getAccessToken());
        $model->updateSettings($this->getSettings());
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(bool $refreshTokenIfExpired = true): bool
    {
        $client = $this->generateAuthorizedClient($refreshTokenIfExpired);
        $endpoint = $this->getEndpoint('/'.$this->getModule());

        $response = $client->get($endpoint);

        $json = json_decode((string) $response->getBody(), true);

        return !empty($json);
    }

    /**
     * Initiate a token refresh and fetch a refreshed token
     * Returns true on success.
     *
     * @throws IntegrationException
     */
    public function refreshToken(): bool
    {
        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $refreshToken = $this->getRefreshToken();

        if (!$clientId || !$clientSecret || !$refreshToken) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client();

        $payload = [
            'refresh_token' => $refreshToken,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token',
        ];

        try {
            $response = $client->post($this->getAccessTokenUrl(), ['query' => $payload]);

            $json = \GuzzleHttp\json_decode($response->getBody(), false);

            if (!isset($json->access_token)) {
                throw new IntegrationException(
                    $this->getTranslator()->translate(
                        "No 'access_token' present in auth response for {serviceProvider}",
                        ['serviceProvider' => $this->getServiceProvider()]
                    )
                );
            }

            $this->setAccessToken($json->access_token);
            $this->setAccessTokenUpdated(true);

            $this->onAfterFetchAccessToken($json);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw $e;
        }

        return true;
    }

    /**
     * Returns the API root url without endpoints specified.
     */
    protected function getApiRootUrl(): string
    {
        $url = $this->getSetting(self::SETTING_API_DOMAIN) ?? 'https://www.zohoapis.com';
        $url = rtrim($url, '/');

        return "{$url}/crm/v2";
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
        $url = $this->getSetting(self::SETTING_ACCOUNTS_SERVER) ?? 'https://accounts.zoho.com';
        $url = rtrim($url, '/');

        return "{$url}/oauth/v2/token";
    }

    /**
     * @throws IntegrationException
     *
     * @return null|string
     */
    protected function getRefreshToken()
    {
        return $this->getSetting(self::SETTING_REFRESH_TOKEN);
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData)
    {
        if (isset($responseData->refresh_token)) {
            $this->setSetting(self::SETTING_REFRESH_TOKEN, $responseData->refresh_token);
        }

        if (isset($responseData->api_domain)) {
            $this->setSetting(self::SETTING_API_DOMAIN, $responseData->api_domain);
        }
    }

    protected function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $client = new Client(
            [
                'headers' => [
                    'Authorization' => 'Bearer '.$this->getAccessToken(),
                    'Content-Type' => 'application/json',
                ],
            ]
        );

        if ($refreshTokenIfExpired) {
            try {
                $this->checkConnection(false);
            } catch (\Exception $e) {
                if ($this->refreshToken()) {
                    $newToken = $this->getAccessToken();
                    $client = new Client(
                        [
                            'headers' => [
                                'Authorization' => 'Bearer '.$newToken,
                                'Content-Type' => 'application/json',
                            ],
                        ]
                    );
                }
            }
        }

        return $client;
    }

    protected function convertFieldType($fieldType, $jsonType)
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
