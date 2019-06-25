<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class SalesforceLead extends AbstractCRMIntegration
{
    const TITLE        = 'Salesforce Lead';
    const LOG_CATEGORY = 'Salesforce';

    const SETTING_SITE_CLIENT_ID     = 'client_id';
    const SETTING_SITE_CLIENT_SECRET = 'client_secret';
    const SETTING_SITE_USER_LOGIN    = 'username';
    const SETTING_SITE_USER_PASSWORD = 'password';
    const SETTING_CLIENT_ID          = 'salesforce_client_id';
    const SETTING_CLIENT_SECRET      = 'salesforce_client_secret';
    const SETTING_USER_LOGIN         = 'salesforce_username';
    const SETTING_USER_PASSWORD      = 'salesforce_password';
    const SETTING_LEAD_OWNER         = 'salesforce_lead_owner';
    const SETTING_SANDBOX            = 'salesforce_sandbox';
    const SETTING_CUSTOM_URL         = 'salesforce_custom_url';
    const SETTING_INSTANCE           = 'instance';

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
                'Enter the Client ID of your Salesforce app in here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_SITE_CLIENT_SECRET,
                'Client Secret',
                'Enter the Client Secret of your Salesforce app here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_SITE_USER_LOGIN,
                'Username',
                'Enter your Salesforce username here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_SITE_USER_PASSWORD,
                'Password',
                'Enter your Salesforce password here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_LEAD_OWNER,
                'Assign Lead Owner?',
                'Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_SANDBOX,
                'Sandbox Mode',
                'Enable this if your Salesforce account is in Sandbox mode (connects to "test.salesforce.com" instead of "login.salesforce.com").',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_CUSTOM_URL,
                'Using custom URL?',
                'Enable this if you connect to your Salesforce account with a custom company URL (e.g. \'mycompany.my.salesforce.com\').',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_CONFIG,
                self::SETTING_CLIENT_ID,
                'Client ID',
                'Enter the Client ID of your Salesforce app in here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_CONFIG,
                self::SETTING_CLIENT_SECRET,
                'Client Secret',
                'Enter the Client Secret of your Salesforce app here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_CONFIG,
                self::SETTING_USER_LOGIN,
                'Username',
                'Enter your Salesforce username here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_CONFIG,
                self::SETTING_USER_PASSWORD,
                'Password',
                'Enter your Salesforce password here.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_INSTANCE,
                'Instance',
                'This will be fetched automatically upon authorizing your credentials.',
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
        $client = new Client();

        $clientId     = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $username     = $this->getUsername();
        $password     = $this->getPassword();

        if (!$clientId || !$clientSecret || !$username || !$password) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $payload = [
            'grant_type'    => 'password',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'username'      => $username,
            'password'      => $password,
        ];

        try {
            $response = $client->post(
                $this->getAccessTokenUrl(),
                [
                    'form_params' => $payload,
                ]
            );

            $json = json_decode((string) $response->getBody());

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
        $username     = $this->getUsername();
        $password     = $this->getPassword();

        // If one of these isn't present, we just return void
        if (!$clientId || !$clientSecret || !$username || !$password) {
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
    public function pushObject(array $keyValueList): bool
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/sobjects/Lead');

        $setOwner = $this->getSetting(self::SETTING_LEAD_OWNER);

        $keyValueList = array_filter($keyValueList);

        try {
            $response = $client->post(
                $endpoint,
                [
                    'headers' => ['Sforce-Auto-Assign' => $setOwner ? 'TRUE' : 'FALSE'],
                    'json'    => $keyValueList,
                ]
            );

            $this->getHandler()->onAfterResponse($this, $response);

            return $response->getStatusCode() === 201;
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
    }

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     */
    public function checkConnection(): bool
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/');

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

        try {
            $response = $client->get($this->getEndpoint('/sobjects/Lead/describe'));
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }

        $data = json_decode((string) $response->getBody());

        $fieldList = [];
        foreach ($data->fields as $field) {
            if (!$field->updateable || !empty($field->referenceTo)) {
                continue;
            }

            $type = null;
            switch ($field->type) {
                case 'string':
                case 'textarea':
                case 'email':
                case 'url':
                case 'address':
                case 'picklist':
                case 'phone':
                    $type = FieldObject::TYPE_STRING;
                    break;

                case 'boolean':
                    $type = FieldObject::TYPE_BOOLEAN;
                    break;

                case 'multipicklist':
                    $type = FieldObject::TYPE_ARRAY;
                    break;

                case 'int':
                case 'number':
                case 'currency':
                    $type = FieldObject::TYPE_NUMERIC;
                    break;

                case 'double':
                    $type = FieldObject::TYPE_FLOAT;
                    break;

                case 'date':
                    $type = FieldObject::TYPE_DATE;
                    break;

                case 'datetime':
                    $type = FieldObject::TYPE_DATETIME;
                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                $field->name,
                $field->label,
                $type,
                !$field->nillable
            );

            $fieldList[] = $fieldObject;
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
        return (bool) $this->fetchAccessToken();
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
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    /**
     * @param \stdClass $responseData
     *
     * @throws CRMIntegrationNotFoundException
     */
    protected function onAfterFetchAccessToken(\stdClass $responseData)
    {
        if (!isset($responseData->instance_url)) {
            throw new CRMIntegrationNotFoundException("Salesforce response data doesn't contain the instance URL");
        }

        $this->setSetting(self::SETTING_INSTANCE, $responseData->instance_url);
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint
     *
     * @return string
     */
    protected function getAuthorizeUrl(): string
    {
        return 'https://' . $this->getLoginUrl() . '.salesforce.com/services/oauth2/authorize';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint
     *
     * @return string
     */
    protected function getAccessTokenUrl(): string
    {
        return 'https://' . $this->getLoginUrl() . '.salesforce.com/services/oauth2/token';
    }

    /**
     * @return string
     */
    protected function getApiRootUrl(): string
    {
        $instance        = $this->getSetting(self::SETTING_INSTANCE);
        $usingCustomUrls = $this->getSetting(self::SETTING_CUSTOM_URL);

        if (strpos($instance, 'https://') !== 0) {
            return sprintf(
                'https://%s%s.salesforce.com/services/data/v44.0/',
                $instance,
                ($usingCustomUrls ? '.my' : '')
            );
        }

        return $instance . '/services/data/v44.0/';
    }

    /**
     * @return string
     */
    private function getLoginUrl(): string
    {
        $isSandboxMode = $this->getSetting(self::SETTING_SANDBOX);

        if ($isSandboxMode) {
            return 'test';
        }

        return 'login';
    }

    /**
     * @return mixed|null
     */
    private function getClientId()
    {
        return $this->getSetting(self::SETTING_SITE_CLIENT_ID) ?: $this->getSetting(self::SETTING_CLIENT_ID);
    }

    /**
     * @return mixed|null
     */
    private function getClientSecret()
    {
        return $this->getSetting(self::SETTING_SITE_CLIENT_SECRET) ?: $this->getSetting(self::SETTING_CLIENT_SECRET);
    }

    /**
     * @return mixed|null
     */
    private function getUsername()
    {
        return $this->getSetting(self::SETTING_SITE_USER_LOGIN) ?: $this->getSetting(self::SETTING_USER_LOGIN);
    }

    /**
     * @return mixed|null
     */
    private function getPassword()
    {
        return $this->getSetting(self::SETTING_SITE_USER_PASSWORD) ?: $this->getSetting(self::SETTING_USER_PASSWORD);
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
                $endpoint = $this->getEndpoint('/sobjects/Opportunity/describe');
                $client->get($endpoint);
            } catch (RequestException $e) {
                if ($e->getCode() === 401) {
                    $client = new Client([
                        'headers' => [
                            'Authorization' => 'Bearer ' . $this->fetchAccessToken(),
                            'Content-Type'  => 'application/json',
                        ],
                    ]);
                }
            }
        }

        return $client;
    }
}
