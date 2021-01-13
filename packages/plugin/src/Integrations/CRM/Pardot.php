<?php

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class Pardot extends AbstractCRMIntegration
{
    const TITLE = 'Pardot';
    const LOG_CATEGORY = 'Pardot';

    const SETTING_EMAIL = 'email';
    const SETTING_PASSWORD = 'password';
    const SETTING_USER_KEY = 'user_key';

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
                self::SETTING_EMAIL,
                'Email',
                'Enter the email of your Pardot account.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_PASSWORD,
                'Password',
                'Enter the password of your Pardot account.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_USER_KEY,
                'API User Key',
                'Enter your API User Key here.',
                false
            ),
        ];
    }

    /**
     * A method that initiates the authentication.
     */
    public function initiateAuthentication()
    {
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
        $client = new Client();

        $email = $this->getEmail();
        $password = $this->getPassword();
        $userKey = $this->getUserKey();

        // If one of these isn't present, we just return void
        if (!$email || !$password || !$userKey) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $payload = [
            'email' => $email,
            'password' => $password,
            'user_key' => $userKey,
            'format' => 'json',
        ];

        try {
            $response = $client->post(
                $this->getLoginUrl(),
                [
                    'form_params' => $payload,
                ]
            );

            $json = \GuzzleHttp\json_decode((string) $response->getBody());

            if (!isset($json->api_key)) {
                throw new IntegrationException(
                    $this->getTranslator()->translate(
                        "No 'access_token' present in auth response for {serviceProvider}",
                        ['serviceProvider' => $this->getServiceProvider()]
                    )
                );
            }

            $this->setAccessToken($json->api_key);
            $this->setAccessTokenUpdated(true);
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
        $email = $this->getEmail();
        $password = $this->getPassword();
        $userKey = $this->getUserKey();

        // If one of these isn't present, we just return void
        if (!$email || !$password || !$userKey) {
            return;
        }

        $this->fetchAccessToken();
        $model->updateAccessToken($this->getAccessToken());
        $model->updateSettings($this->getSettings());
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
            $response = $client->get(
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

            $json = \GuzzleHttp\json_decode($response->getBody(), true);

            return isset($json['@attributes']) && 'ok' === $json['@attributes']['stat'];
        } catch (RequestException $e) {
            return false;
        }
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

    protected function getApiRootUrl(): string
    {
        return 'https://pi.pardot.com/api/';
    }

    private function getLoginUrl(): string
    {
        return 'https://pi.pardot.com/api/login/version/4';
    }

    /**
     * @return null|mixed
     */
    private function getEmail()
    {
        return $this->getSetting(self::SETTING_EMAIL);
    }

    /**
     * @return null|mixed
     */
    private function getUserKey()
    {
        return $this->getSetting(self::SETTING_USER_KEY);
    }

    /**
     * @return null|mixed
     */
    private function getPassword()
    {
        return $this->getSetting(self::SETTING_PASSWORD);
    }

    private function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $userKey = $this->getUserKey();
        $apiKey = $this->getAccessToken();

        $client = $this->generateClient($apiKey, $userKey);

        if ($refreshTokenIfExpired) {
            try {
                $endpoint = $this->getPardotEndpoint();
                $response = $client->get($endpoint, ['query' => ['limit' => 1, 'format' => 'json']]);

                $json = \GuzzleHttp\json_decode($response->getBody(), true);

                if (isset($json['@attributes']) && 'ok' === $json['@attributes']['stat']) {
                    return $client;
                }
            } catch (RequestException $e) {
            }

            $client = $this->generateClient($this->fetchAccessToken(), $userKey);
        }

        return $client;
    }

    private function generateClient(string $apiKey, string $userKey): Client
    {
        return new Client([
            'headers' => [
                'Authorization' => 'Pardot api_key='.$apiKey.', user_key='.$userKey,
                'Content-Type' => 'application/json',
            ],
            'query' => [
                'format' => 'json',
            ],
        ]);
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
