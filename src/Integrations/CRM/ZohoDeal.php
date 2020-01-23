<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Matrix\Exception;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class ZohoDeal extends AbstractCRMIntegration
{
    const TITLE        = 'Zoho Deal';
    const LOG_CATEGORY = 'Zoho';
    const MODULE       = 'Deals';

    const DEAL_MODULE    = 'Deals';
    const ACCOUNT_MODULE = 'Accounts';
    const CONTACT_MODULE = 'Contacts';

    const DEAL_CATEGORY    = 'deal';
    const ACCOUNT_CATEGORY = 'account';
    const CONTACT_CATEGORY = 'contact';

    const DEFAULT_CONTACT_ROLE = '4201883000000006871';

    const SETTING_SITE_CLIENT_ID          = 'client_id';
    const SETTING_SITE_CLIENT_SECRET      = 'client_secret';
    const SETTING_REDIRECT_URL            = 'redirect_url';
    const SETTING_GRANT_TOKEN             = 'grant_token';
    const SETTING_ACCOUNT_URL             = 'account_url';
    const SETTING_ACCESS_TOKEN_URL        = 'access_token_url';
    const SETTING_API_ROOT_URL            = 'api_root_url';
    const SETTING_REFRESH_TOKEN           = 'refresh_token';
    const SETTING_ACCESS_TOKEN_EXPIRES_IN = 'accest_token_expires_in';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens
     *
     * @return SettingBlueprint[]
     */
    public static function getSettingBlueprints(): array
    {
        return [
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_SITE_CLIENT_ID,
                'Client ID',
                'Enter your Zoho Client ID here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_SITE_CLIENT_SECRET,
                'Client Secret',
                'Enter your Zoho Client Secret here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_GRANT_TOKEN,
                'Grant Token',
                'Enter your Zoho Grant Token here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_REDIRECT_URL,
                'Redirect URL',
                'Enter your site URL here (e.g. \'https://mysite.com\').',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_ACCOUNT_URL,
                'Account URL',
                'Enter your Zoho Developer Account URL here (e.g. \'https://accounts.zoho.com\' or \'https://accounts.zoho.eu\').',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_ACCESS_TOKEN_URL,
                'Access Token URL',
                'Enter your Zoho Developer Access Token URL here (e.g. \'https://accounts.zoho.com/oauth/v2/token\' or \'https://accounts.zoho.eu/oauth/v2/token\').',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_API_ROOT_URL,
                'API Root URL',
                'Enter your Zoho Developer Root URL here (e.g. \'https://www.zohoapis.com/crm/v2\' or \'https://www.zohoapis.eu/crm/v2\').',
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
                self::SETTING_ACCESS_TOKEN_EXPIRES_IN,
                'Refresh Token expires in',
                'You should not set this',
                false
            ),
        ];
    }

    /**
     * A method that initiates the authentication
     */
    public function initiateAuthentication()
    {
    }

    /**
     * Authorizes the application
     * Returns the access_token
     *
     * @return string
     * @throws IntegrationException
     * @throws \Exception
     */
    public function fetchAccessToken(): string
    {
        $clientId       = $this->getClientId();
        $clientSecret   = $this->getClientSecret();
        $redirectUri    = $this->getRedirectUrl();
        $grantToken     = $this->getGrantToken();
        $accountUrl     = $this->getAccountUrl();
        $accessTokenUrl = $this->getAccessTokenUrl();
        $apiRootUrl     = $this->getApiRootUrl();

        if (!$clientId || !$clientSecret || !$redirectUri || !$grantToken || !$accessTokenUrl || !$apiRootUrl) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client([
            'headers' => [
                'Authorization' => 'Basic ' . $clientId . ':' . $clientSecret,
                'Content-Type'  => 'application/x-www-form-urlencoded',
            ],
        ]);

        $payload = [
            'grant_type'    => 'authorization_code',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri'  => $redirectUri,
            'code'          => $grantToken,
        ];

        try {
            $response = $client->post(
                $accountUrl . '/oauth/v2/token',
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
     * Perform anything necessary before this integration is saved
     *
     * @param IntegrationStorageInterface $model
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        $clientId     = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $redirectUri  = $this->getRedirectUrl();
        $grantToken   = $this->getGrantToken();

        if (!$clientId || !$clientSecret || !$redirectUri || !$grantToken) {
            return;
        }

        $this->fetchAccessToken();
        $model->updateAccessToken($this->getAccessToken());
        $model->updateSettings($this->getSettings());
    }

    /**
     * Push objects to the CRM
     *
     * @param array $keyValueList
     *
     * @return bool
     * @throws \Exception
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $client = $this->generateAuthorizedClient();

        $dealMapping = $contactMapping = $accountMapping = [];
        foreach ($keyValueList as $key => $value) {
            if (empty($value) || !preg_match('/^(\w+)___(.*)$/', $key, $matches)) {
                continue;
            }

            list ($_, $category, $handle) = $matches;

            switch ($category) {
                case self::DEAL_CATEGORY:
                    $dealMapping[$handle] = $value;
                    break;
                case self::CONTACT_CATEGORY:
                    $contactMapping[$handle] = $value;
                    break;
                case self::ACCOUNT_CATEGORY:
                    $accountMapping[$handle] = $value;
                    break;
            }
        }

        // Push Account
        $endpoint  = $this->getEndpoint('/' . self::ACCOUNT_MODULE . '/upsert');
        $accountId = null;

        try {
            $response = $client->post(
                $endpoint,
                [
                    'json' => [
                        'data'                   => [
                            $accountMapping,
                        ],
                        'duplicate_check_fields' => [
                            "Account_Name",
                        ],
                    ],
                ]
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->getHandler()->onAfterResponse($this, $response);

            if (isset($json['data'][0]['details']['id'])) {
                $accountId = $json['data'][0]['details']['id'];
            }

        } catch (RequestException $e) {
            $exceptionResponse = $e->getResponse();
            if (!$exceptionResponse) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

                throw $e;
            }

            $responseBody = (string) $exceptionResponse->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            if ($exceptionResponse->getStatusCode() === 400) {
                $errors = json_decode((string) $exceptionResponse->getBody());

                if (\is_array($errors)) {
                    foreach ($errors as $error) {
                        if (strtoupper($error->errorCode) === 'REQUIRED_FIELD_MISSING') {
                            return false;
                        }
                    }

                }
            }

            throw $e;
        }

        // Push Contact
        $endpoint  = $this->getEndpoint('/' . self::CONTACT_MODULE . '/upsert');
        $contactId = null;

        try {
            $response = $client->post(
                $endpoint,
                [
                    'json' => [
                        'data'                   => [
                            $contactMapping,
                        ],
                        'duplicate_check_fields' => [
                            "Email",
                        ],
                    ],
                ]
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->getHandler()->onAfterResponse($this, $response);

            if (isset($json['data'][0]['details']['id'])) {
                $contactId = $json['data'][0]['details']['id'];
            }

        } catch (RequestException $e) {
            $exceptionResponse = $e->getResponse();
            if (!$exceptionResponse) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

                throw $e;
            }

            $responseBody = (string) $exceptionResponse->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            if ($exceptionResponse->getStatusCode() === 400) {
                $errors = json_decode((string) $exceptionResponse->getBody());

                if (\is_array($errors)) {
                    foreach ($errors as $error) {
                        if (strtoupper($error->errorCode) === 'REQUIRED_FIELD_MISSING') {
                            return false;
                        }
                    }

                }
            }

            throw $e;
        }

        // Push Deal
        $endpoint = $this->getEndpoint('/' . self::DEAL_MODULE);
        $dealId   = null;

        try {
            $response = $client->post(
                $endpoint,
                [
                    'json' => [
                        'data' => [$dealMapping],
                    ],
                ]
            );

            $this->getHandler()->onAfterResponse($this, $response);
            $json = json_decode((string) $response->getBody(), true);


            if (isset($json['data'][0]['details']['id'])) {
                $dealId = $json['data'][0]['details']['id'];
            }

        } catch (RequestException $e) {
            $exceptionResponse = $e->getResponse();
            if (!$exceptionResponse) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

                throw $e;
            }

            $responseBody = (string) $exceptionResponse->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            if ($exceptionResponse->getStatusCode() === 400) {
                $errors = json_decode((string) $exceptionResponse->getBody());

                if (\is_array($errors)) {
                    foreach ($errors as $error) {
                        if (strtoupper($error->errorCode) === 'REQUIRED_FIELD_MISSING') {
                            return false;
                        }
                    }

                }
            }

            throw $e;
        }

        // Connect Contact to Deal
        $endpoint = $this->getEndpoint('/' . self::CONTACT_MODULE . '/' . $contactId . '/' . self::DEAL_MODULE . '/' . $dealId);
        try {
            $response = $client->put(
                $endpoint,
                [
                    'json' => [
                        'data' => [
                            [
                                "Contact_Role" => self::DEFAULT_CONTACT_ROLE,
                            ],
                        ],
                    ],
                ]
            );

            $json = \GuzzleHttp\json_decode($response->getBody(), false);

        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

            throw $e;
        }

        return true;
    }

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     */
    public function checkConnection(): bool
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/' . self::MODULE);

        $response = $client->get($endpoint);

        $json = json_decode((string) $response->getBody(), true);

        return !empty($json);
    }

    /**
     * Fetch the custom fields from the integration
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $client = $this->generateAuthorizedClient();

        $fieldEndpoints = [
            ['endpoint' => self::DEAL_MODULE, 'category' => 'deal'],
            ['endpoint' => self::CONTACT_MODULE, 'category' => 'contact'],
            ['endpoint' => self::ACCOUNT_MODULE, 'category' => 'account'],
        ];

        $fieldList = [];

        foreach ($fieldEndpoints as $item) {
            $category = $item['category'];
            $module   = $item['endpoint'];

            try {
                $endpoint = $this->getEndpoint('/settings/fields?module=' . $module);
                $response = $client->get($endpoint);

            } catch (RequestException $e) {
                $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

                return [];
            }

            $data = json_decode((string) $response->getBody());

            foreach ($data->fields as $field) {

                if ($field->read_only || $field->field_read_only) {
                    continue;
                }

                $jsonType = null;

                if (isset($field->json_type)) {
                    $jsonType = $field->json_type;
                }

                $fieldType = $this->convertFieldType($field->data_type, $jsonType);

                $fieldObject = new FieldObject(
                    $category . '___' . $field->api_name,
                    $field->field_label . " ($module)",
                    $fieldType
                );

                $fieldList[] = $fieldObject;
            }
        }

        return $fieldList;
    }

    /**
     * Initiate a token refresh and fetch a refreshed token
     * Returns true on success
     *
     * @return bool
     * @throws IntegrationException
     */
    public function refreshToken(): bool
    {
        $clientId     = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $refreshToken = $this->getSettings()[self::SETTING_REFRESH_TOKEN];
        $accountUrl   = $this->getAccountUrl();

        if (!$clientId || !$clientSecret || !$refreshToken || !$accountUrl) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client([
            'headers' => [
                'Authorization' => 'Basic ' . $clientId . ':' . $clientSecret,
                'Content-Type'  => 'application/x-www-form-urlencoded',
            ],
        ]);

        try {
            $response = $client->post(
                $accountUrl . '/oauth/v2/token?refresh_token=' . $refreshToken . '&client_id=' . $clientId . '&client_secret=' . $clientSecret . '&grant_type=refresh_token'
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

        return true;
    }

    /**
     * @param FieldObject   $fieldObject
     * @param AbstractField $field
     *
     * @return array|bool|string
     */
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field)
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if ($fieldObject->getType() === FieldObject::TYPE_ARRAY) {
            $value = $value;
        }

        return $value;
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint
     *
     * @return string
     */
    protected function getAuthorizeUrl(): string
    {
        return '';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint
     *
     * @return string
     */
    protected function getAccessTokenUrl(): string
    {
        return $this->getSetting(self::SETTING_ACCESS_TOKEN_URL);
    }

    /**
     * @return string
     */
    protected function getApiRootUrl(): string
    {
        return $this->getSetting(self::SETTING_API_ROOT_URL);
    }

    /**
     * @return mixed|null
     */
    private function getClientId()
    {
        return $this->getSetting(self::SETTING_SITE_CLIENT_ID);
    }

    /**
     * @return mixed|null
     */
    private function getClientSecret()
    {
        return $this->getSetting(self::SETTING_SITE_CLIENT_SECRET);
    }

    /**
     * @return mixed|null
     */
    private function getRedirectUrl()
    {
        return $this->getSetting(self::SETTING_REDIRECT_URL);
    }

    /**
     * @return mixed|null
     */
    private function getGrantToken()
    {
        return $this->getSetting(self::SETTING_GRANT_TOKEN);
    }

    /**
     * @return mixed|null
     */
    private function getAccountUrl()
    {
        return $this->getSetting(self::SETTING_ACCOUNT_URL);
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData)
    {
        if (isset($responseData->refresh_token)) {
            $this->setSetting(self::SETTING_REFRESH_TOKEN, $responseData->refresh_token);
        }
    }

    /**
     * @param bool $refreshTokenIfExpired
     *
     * @return Client
     */
    private function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $client = new Client([
            'headers' => [
                'Authorization' => 'Bearer ' . $this->getAccessToken(),
                'Content-Type'  => 'application/json',
            ],
        ]);

        if ($refreshTokenIfExpired) {
            try {
                $endpoint = $this->getEndpoint('/' . self::MODULE);
                $response = $client->get($endpoint);
            } catch (\Exception $e) {

                if ($this->refreshToken()) {
                    $newToken = $this->getAccessToken();
                    $client   = new Client([
                        'headers' => [
                            'Authorization' => 'Bearer ' . $newToken,
                            'Content-Type'  => 'application/json',
                        ],
                    ]);
                }
            }
        }

        return $client;
    }

    private function convertFieldType($fieldType, $jsonType)
    {
        $type = null;

        switch ($fieldType) {
            case 'text':
            case 'textarea':
            case 'website':
            case 'phone':
                $type = FieldObject::TYPE_STRING;
                break;

            case 'boolean':
                $type = FieldObject::TYPE_BOOLEAN;
                break;

            case 'list':
            case 'picklist':

                if ($jsonType == 'jsonobject') {
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
