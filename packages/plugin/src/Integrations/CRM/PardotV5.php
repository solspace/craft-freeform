<?php

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\CRMOAuthConnector;
use Solspace\Freeform\Library\Integrations\CRM\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class PardotV5 extends CRMOAuthConnector implements RefreshTokenInterface
{
    public const TITLE = 'Pardot (v5)';
    public const LOG_CATEGORY = 'Pardot';

    public const SETTING_BUSINESS_UNIT_ID = 'business_unit_id';
    public const SETTING_REFRESH_TOKEN = 'refresh_token';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens.
     *
     * @return SettingBlueprint[]
     */
    public static function getSettingBlueprints(): array
    {
        return array_merge(
            parent::getSettingBlueprints(),
            [
                new SettingBlueprint(
                    SettingBlueprint::TYPE_TEXT,
                    self::SETTING_BUSINESS_UNIT_ID,
                    'Pardot Business Unit ID',
                    'Enter your Pardot business unit ID here',
                    true
                ),
                new SettingBlueprint(
                    SettingBlueprint::TYPE_INTERNAL,
                    self::SETTING_REFRESH_TOKEN,
                    'Refresh Token',
                    'Refresh token set automatically'
                ),
                new SettingBlueprint(
                    SettingBlueprint::TYPE_INTERNAL,
                    self::SETTING_REFRESH_TOKEN,
                    'Refresh Token',
                    'You should not set this',
                    false
                ),
            ]
        );
    }

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
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
        ];

        header('Location: '.$this->getAuthorizeUrl().'?'.http_build_query($payload));

        exit();
    }

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
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
    }

    /**
     * Push objects to the CRM.
     *
     * @param null $formFields
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $email = null;
        foreach ($keyValueList as $key => $value) {
            if ('email' === $key) {
                $email = $value;
                unset($keyValueList[$key]);

                continue;
            }

            if (preg_match('/^custom___/', $key)) {
                unset($keyValueList[$key]);
                $keyValueList[str_replace('custom___', '', $key)] = $value;
            }
        }

        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getPardotEndpoint('prospect', 'create/email/'.$email);

        try {
            $response = $client->post(
                $endpoint,
                ['query' => $keyValueList]
            );

            $this->getHandler()->onAfterResponse($this, $response);

            return true;
        } catch (RequestException $exception) {
            $responseBody = (string) $exception->getRequest()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $exception->getMessage()]);
        }

        return false;
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getPardotEndpoint();

        try {
            $response = $client->get($endpoint, ['query' => ['limit' => 1, 'format' => 'json']]);

            $json = json_decode($response->getBody(), true);

            return isset($json['@attributes']) && 'ok' === $json['@attributes']['stat'];
        } catch (RequestException $e) {
            return false;
        }
    }

    /**
     * @return array|bool|string
     */
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field)
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get($this->getPardotEndpoint('customField'));
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }

        $data = json_decode((string) $response->getBody());

        $fieldList = [
            new FieldObject(
                'salutation',
                'Salutation',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'first_name',
                'First Name',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'last_name',
                'Last Name',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'email',
                'Email',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'password',
                'Password',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'company',
                'Company',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'prospect_account_id',
                'Prospect Account Id',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'website',
                'Website',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'job_title',
                'Job Title',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'department',
                'Department',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'country',
                'Country',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'address_one',
                'Address One',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'address_two',
                'Address Two',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'city',
                'City',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'state',
                'State',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'territory',
                'Territory',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'zip',
                'Zip',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'phone',
                'Phone',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'fax',
                'Fax',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'source',
                'Source',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'annual_revenue',
                'Annual Revenue',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'employees',
                'Employees',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'industry',
                'Industry',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'years_in_business',
                'Years in Business',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'comments',
                'Comments',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'notes',
                'Notes',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'score',
                'Score',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'is_do_not_email',
                'Do not email',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_do_not_call',
                'Do not call',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_reviewed',
                'Reviewed',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_archived',
                'Archived',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_starred',
                'Starred',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'campaign_id',
                'Campaign',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'profile',
                'Profile',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'assign_to',
                'Assign To',
                FieldObject::TYPE_STRING
            ),
        ];

        if (!$data || !isset($data->result)) {
            return $fieldList;
        }

        foreach ($data->result->customField as $field) {
            if (\is_array($field)) {
                $field = (object) $field;
            }

            if (!\is_object($field) || !isset($field->type)) {
                continue;
            }

            switch ($field->type) {
                case 'Text':
                case 'Textarea':
                case 'TextArea':
                case 'Dropdown':
                case 'Radio Button':
                case 'Hidden':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'Checkbox':
                case 'Multi-Select':
                    $type = FieldObject::TYPE_ARRAY;

                    break;

                case 'Number':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;

                case 'Date':
                    $type = FieldObject::TYPE_DATE;

                    break;

                default:
                    $type = null;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                'custom___'.$field->field_id,
                $field->name.' (Custom Fields)',
                $type
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    protected function getAuthorizeUrl(): string
    {
        return 'https://login.salesforce.com/services/oauth2/authorize';
    }

    protected function getAccessTokenUrl(): string
    {
        return 'https://login.salesforce.com/services/oauth2/token';
    }

    protected function getApiRootUrl(): string
    {
        return 'https://pi.pardot.com/api/';
    }

    protected function getRefreshToken()
    {
        return $this->getSetting(self::SETTING_REFRESH_TOKEN);
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData)
    {
        if (isset($responseData->refresh_token)) {
            $this->setSetting(self::SETTING_REFRESH_TOKEN, $responseData->refresh_token);
        }
    }

    private function getBusinessUnitId()
    {
        return $this->getSetting(self::SETTING_BUSINESS_UNIT_ID);
    }

    private function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $client = new Client([
            'headers' => [
                'Authorization' => 'Bearer '.$this->getAccessToken(),
                'Pardot-Business-Unit-Id' => $this->getBusinessUnitId(),
                'Content-Type' => 'application/json',
            ],
            'query' => [
                'format' => 'json',
            ],
        ]);

        if ($refreshTokenIfExpired) {
            try {
                $endpoint = $this->getPardotEndpoint();
                $response = $client->get($endpoint, ['query' => ['limit' => 1, 'format' => 'json']]);

                $json = json_decode($response->getBody(), true);

                if (isset($json['@attributes']) && 'ok' === $json['@attributes']['stat']) {
                    return $client;
                }
            } catch (RequestException $e) {
                if (401 === $e->getCode()) {
                    if ($this->refreshToken()) {
                        $client = new Client(
                            [
                                'headers' => [
                                    'Authorization' => 'Bearer '.$this->getAccessToken(),
                                    'Pardot-Business-Unit-Id' => $this->getBusinessUnitId(),
                                    'Content-Type' => 'application/json',
                                ],
                                'query' => [
                                    'format' => 'json',
                                ],
                            ]
                        );
                    }
                }
            }
        }

        return $client;
    }

    /**
     * @param string $object
     * @param string $action
     */
    private function getPardotEndpoint($object = 'prospect', $action = 'query'): string
    {
        $root = rtrim($this->getApiRootUrl(), '/');
        $object = trim($object, '/');
        $action = ltrim($action, '/');

        return "{$root}/{$object}/version/4/do/{$action}";
    }
}
