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

use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Fields\CheckboxGroupField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class SalesforceOpportunity extends AbstractCRMIntegration
{
    const TITLE        = 'Salesforce Opportunity';
    const LOG_CATEGORY = 'Salesforce';

    const SETTING_CLIENT_ID                     = 'client_id';
    const SETTING_CLIENT_SECRET                 = 'client_secret';
    const SETTING_USER_LOGIN                    = 'username';
    const SETTING_USER_PASSWORD                 = 'password';
    const SETTING_CLOSE_DATE                    = 'close_date';
    const SETTING_STAGE                         = 'stage';
    const SETTING_SANDBOX                       = 'sandbox';
    const SETTING_APPEND_ACCOUNT_DATA           = 'append_account_data';
    const SETTING_APPEND_CONTACT_DATA           = 'append_contact_data';
    const SETTING_DOMAIN_DUPLICATE_CHECK_LOGIC  = 'domain_duplicate_check_logic';
    const SETTING_INSTANCE_URL                  = 'instance_url';
    const SETTING_DATA_URL                      = 'data_url';

    const FIELD_CATEGORY_OPPORTUNITY            = 'opportunity';
    const FIELD_CATEGORY_ACCOUNT                = 'account';
    const FIELD_CATEGORY_CONTACT                = 'contact';

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
                self::SETTING_CLIENT_ID,
                'Client ID',
                'Enter the Client ID of your Salesforce app in here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_CLIENT_SECRET,
                'Client Secret',
                'Enter the Client Secret of your Salesforce app here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_USER_LOGIN,
                'Username',
                'Enter your Salesforce username here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_PASSWORD,
                self::SETTING_USER_PASSWORD,
                'Password',
                'Enter your Salesforce password here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_CLOSE_DATE,
                'Close Date',
                'Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. \'7 days\').',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_STAGE,
                'Stage Name',
                'Enter the Stage Name the newly created Opportunity should be assigned to (e.g. \'Prospecting\').',
                true
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
                self::SETTING_APPEND_CONTACT_DATA,
                'Append checkbox group field values on Contact update?',
                'If a Contact already exists in Salesforce, enabling this will append additional checkbox group field values to the Contact inside Salesforce, instead of overwriting the options.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_APPEND_ACCOUNT_DATA,
                'Append checkbox group field values on Account update?',
                'If an Account already exists in Salesforce, enabling this will append additional checkbox group field values to the Account inside Salesforce, instead of overwriting the options.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_DOMAIN_DUPLICATE_CHECK_LOGIC,
                'Check Contact email address and Account website when checking for duplicates?',
                'By default, Freeform will check against Contact first name, last name and email address, as well as and Account name. If enabled, Freeform will instead check against Contact email address only and Account website. If no website is mapped, Freeform will gather the website domain from the Contact email address mapped.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_INSTANCE_URL,
                'Instance URL',
                'This will be fetched automatically upon authorizing your credentials.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_DATA_URL,
                'Data URL',
                'This is the URL that points to the latest Salesforce API resource version.',
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
     * @param array $formFields
     *
     * @return bool
     * @throws \Exception
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $isAppendContactData = $this->getSetting(self::SETTING_APPEND_CONTACT_DATA);
        $isAppendAccountData = $this->getSetting(self::SETTING_APPEND_ACCOUNT_DATA);
        $domainDuplicateCheck = $this->getSetting(self::SETTING_DOMAIN_DUPLICATE_CHECK_LOGIC);

        $appendContactFields = [];
        $appendAccountFields = [];

        $opportunityMapping = $accountMapping = $contactMapping = [];
        foreach ($keyValueList as $key => $value) {
            if (empty($value) || !preg_match('/^(\w+)___(.*)$/', $key, $matches)) {
                continue;
            }

            list ($_, $category, $handle) = $matches;
            switch ($category) {
                case self::FIELD_CATEGORY_OPPORTUNITY:
                    $opportunityMapping[$handle] = $value;
                    break;
                case self::FIELD_CATEGORY_ACCOUNT:
                    $accountMapping[$handle] = $value;

                    // Checks which account's values we'll need to append to an existing SF value based on a form field type
                    if ($isAppendAccountData) {
                        if (array_key_exists($key, $formFields)) {
                            if ($this->isAppendFieldType($formFields[$key])) {
                                $appendAccountFields[] = $handle;
                            }
                        }
                    }

                    break;
                case self::FIELD_CATEGORY_CONTACT:
                    $contactMapping[$handle] = $value;

                    // Checks which contact's values we'll need to append to an existing SF value based on a form field type
                    if ($isAppendContactData) {
                        if (array_key_exists($key, $formFields)) {
                            if ($this->isAppendFieldType($formFields[$key])) {
                                $appendContactFields[] = $handle;
                            }
                        }
                    }

                    break;
            }
        }

        $client = $this->generateAuthorizedClient();

        try {
            $closeDate = new Carbon($this->getSetting(self::SETTING_CLOSE_DATE));
        } catch (\Exception $e) {
            $closeDate = new Carbon();
        }

        $accountName      = $accountMapping['Name'] ?? null;
        $accountWebsite   = $accountMapping['Website'] ?? null;
        $contactFirstName = $contactMapping['FirstName'] ?? null;
        $contactLastName  = $contactMapping['LastName'] ?? null;
        $contactEmail     = $contactMapping['Email'] ?? null;
        $contactName      = trim("$contactFirstName $contactLastName");
        if (empty($accountName)) {
            $accountName            = $contactName;
            $accountMapping['Name'] = $accountName;
        }

        // We'll query
        $appendAccountFieldsQuery = '';

        // Check if contact has an email which we can use to get account website
        if ($domainDuplicateCheck && !$accountWebsite && $contactEmail) {
            $accountWebsite = $this->extractDomainFromEmail($contactEmail);

            if ($accountWebsite) {
                $accountMapping['Website'] = $accountWebsite;
            }
        }

        // We'll query Account's contacts so we can later extract a website domain from contact's email address
        if (!$accountWebsite) {
            $appendAccountFieldsQuery = ', (select id, email from Contacts)';
        }

        // We'll query fields to which we have to append new values
        if ($appendAccountFields) {
            $appendAccountFieldsQuery = ', ' . implode(', ', $appendAccountFields) . ' ';
        }

        $accountRecord = null;

        // If the advanced mapping is enabled and we have an account website which we can use for a search
        if ($domainDuplicateCheck) {

            if ($accountWebsite) {
                // We'll search for an account with account website
                $accountRecord = $this->querySingle(
                    "SELECT Id" . $appendAccountFieldsQuery . "
                    FROM Account
                    WHERE Website = '%s'
                    ORDER BY CreatedDate desc
                    LIMIT 1",
                    [$accountWebsite]
                );
            }

        } else {
            $accountRecord = $this->querySingle(
                "SELECT Id" . $appendAccountFieldsQuery . "
                FROM Account
                WHERE Name = '%s'
                ORDER BY CreatedDate desc
                LIMIT 1",
                [$accountName]
            );
        }

        // We'll extract a website domain from contact's email address to latter add it to the account
//        if ($domainDuplicateCheck && !$accountWebsite && $accountRecord) {
//            if (isset($accountRecord->Contacts->records) && $accountRecord->Contacts->records) {
//                $accountMapping['Website'] = $this->extractWebsiteDomainFromContacts($accountRecord->Contacts->records);
//            }
//        }

        $appendFieldsQuery = '';

        if ($appendContactFields) {
            $appendFieldsQuery = ', ' . implode(', ', $appendContactFields) . ' ';
        }

        $contactRecord = null;
        if (!empty($contactEmail)) {
            $contactRecord = $this->querySingle(
                "SELECT Id" . $appendFieldsQuery . "
                FROM Contact
                WHERE Email = '%s'
                ORDER BY CreatedDate desc
                LIMIT 1",
                [$contactEmail]
            );
        }

        if (!$contactRecord) {
            $contactRecord = $this->querySingle(
                "SELECT Id" . $appendFieldsQuery . "
                FROM Contact
                WHERE Name = '%s'
                ORDER BY CreatedDate desc
                LIMIT 1",
                [$contactName]
            );
        }

        try {
            if ($accountRecord) {

                // We'll prepare appendable values
                if ($isAppendAccountData) {
                    $accountMapping = $this->appendValues($accountMapping, $accountRecord, $appendAccountFields);
                }

                $accountEndpoint = $this->getEndpoint('/sobjects/Account/' . $accountRecord->Id);
                $response        = $client->patch($accountEndpoint, ['json' => $accountMapping]);
                $accountId       = $accountRecord->Id;
                $this->getHandler()->onAfterResponse($this, $response);
            } else {
                $accountEndpoint = $this->getEndpoint('/sobjects/Account');
                $accountResponse = $client->post($accountEndpoint, ['json' => $accountMapping]);
                $accountId       = json_decode($accountResponse->getBody())->id;
                $this->getHandler()->onAfterResponse($this, $accountResponse);
            }

            $contactMapping['AccountId'] = $accountId;

            if ($contactRecord) {

                // We'll prepare appendable values
                if ($isAppendContactData) {
                    $contactMapping = $this->appendValues($contactMapping, $contactRecord, $appendContactFields);
                }

                $contactEndpoint = $this->getEndpoint('/sobjects/Contact/' . $contactRecord->Id);
                $response        = $client->patch($contactEndpoint, ['json' => $contactMapping]);
                $this->getHandler()->onAfterResponse($this, $response);
            } else {
                $contactEndpoint = $this->getEndpoint('/sobjects/Contact');
                $response        = $client->post($contactEndpoint, ['json' => $contactMapping]);
                $this->getHandler()->onAfterResponse($this, $response);
            }

            $opportunityMapping['CloseDate'] = $closeDate->toIso8601ZuluString();
            $opportunityMapping['AccountId'] = $accountId;
            $opportunityMapping['StageName'] = $this->getSetting(self::SETTING_STAGE);

            $response = $client->post($this->getEndpoint('/sobjects/Opportunity'), ['json' => $opportunityMapping]);
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

        $fieldEndpoints = [
            ['category' => self::FIELD_CATEGORY_OPPORTUNITY, 'endpoint' => 'Opportunity'],
            ['category' => self::FIELD_CATEGORY_ACCOUNT, 'endpoint' => 'Account'],
            ['category' => self::FIELD_CATEGORY_CONTACT, 'endpoint' => 'Contact'],
        ];

        $fieldList = [];
        foreach ($fieldEndpoints as $item) {
            $category = $item['category'];
            $endpoint = $item['endpoint'];

            try {
                $response = $client->get($this->getEndpoint("/sobjects/$endpoint/describe"));
            } catch (RequestException $e) {
                $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);
                continue;
            }

            $data = json_decode((string) $response->getBody());

            foreach ($data->fields as $field) {
                if (!$field->updateable || !empty($field->referenceTo)) {
                    continue;
                }

                if ($field->name === 'StageName') {
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
                    $category . '___' . $field->name,
                    $field->label . " ($endpoint)",
                    $type,
                    !$field->nillable
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

        $client   = $this->generateAuthorizedClient(false);
        $endpoint = $responseData->instance_url . '/services/data';

        $response = $client->get($endpoint);
        $data     = json_decode((string) $response->getBody());

        $latestVersion = array_pop($data);

        $this->setSetting(self::SETTING_DATA_URL, $latestVersion->url);
        $this->setSetting(self::SETTING_INSTANCE_URL, $responseData->instance_url);
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
        return $this->getInstanceUrl() . $this->getDataUrl();
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
        return $this->getSetting(self::SETTING_CLIENT_ID);
    }

    /**
     * @return mixed|null
     */
    private function getClientSecret()
    {
        return $this->getSetting(self::SETTING_CLIENT_SECRET);
    }

    /**
     * @return mixed|null
     */
    private function getUsername()
    {
        return $this->getSetting(self::SETTING_USER_LOGIN);
    }

    /**
     * @return mixed|null
     */
    private function getPassword()
    {
        return $this->getSetting(self::SETTING_USER_PASSWORD);
    }

    /**
     * @return string|null
     * @throws IntegrationException
     */
    private function getInstanceUrl()
    {
        return $this->getSetting(self::SETTING_INSTANCE_URL);
    }

    /**
     * @return string|null
     * @throws IntegrationException
     */
    private function getDataUrl()
    {
        return $this->getSetting(self::SETTING_DATA_URL);
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

    /**
     * @param string $query
     * @param array  $params
     *
     * @return mixed
     */
    private function query(string $query, array $params = []): array
    {
        $client = $this->generateAuthorizedClient();

        $params = array_map([$this, 'soqlEscape'], $params);
        $query  = sprintf($query, ...$params);

        try {
            $response = $client->get(
                $this->getEndpoint('/query'),
                [
                    'query' => [
                        'q' => $query,
                    ],
                ]
            );

            $result = \GuzzleHttp\json_decode($response->getBody());

            if ($result->totalSize === 0 || !$result->done) {
                return [];
            }

            return $result->records;
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }
    }

    /**
     * @param string $query
     * @param array  $params
     *
     * @return mixed|null
     */
    private function querySingle(string $query, array $params = [])
    {
        $data = $this->query($query, $params);

        if (\count($data) >= 1) {
            return reset($data);
        }

        return null;
    }

    /**
     * @param string $str
     *
     * @return string
     */
    private function soqlEscape(string $str = ''): string
    {
        $characters  = [
            '\\',
            '\'',
        ];
        $replacement = [
            '\\\\',
            '\\\'',
        ];

        return str_replace($characters, $replacement, $str);
    }

    /**
     * Checks if Form field's type calls for a value append
     *
     * @param $formField
     *
     * @return bool
     */
    private function isAppendFieldType($formField)
    {
        return $formField instanceof CheckboxGroupField;
    }

    /**
     * Goes through all of the mapped values, checks which values have to be appended and appends them to the record's
     * values
     *
     * @param $mappedValues
     * @param $record
     * @param $appendFields
     *
     * @return mixed
     */
    private function appendValues($mappedValues, $record, $appendFields)
    {
        foreach ($mappedValues as $fieldHandle => $value) {
            if (in_array($fieldHandle, $appendFields)) {
                if (isset($record->{$fieldHandle}) && $record->{$fieldHandle}) {

                    if ($value) {
                        $mappedValues[$fieldHandle] = $record->{$fieldHandle} . ';' . $value;
                    } else {
                        $mappedValues[$fieldHandle] = $record->{$fieldHandle};
                    }

                    // Clean up duplicate values
                    $valueArray = explode(';', $mappedValues[$fieldHandle]);
                    $valueArray = array_unique($valueArray);
                    $mappedValues[$fieldHandle]  = implode(';', $valueArray);
                }
            }
        }

        return $mappedValues;
    }

    /**
     * Goes through all of the SF Contact records, finds an email address and returns a domain name from the email
     * address
     *
     * @param $contacts - SF Contact records
     *
     * @return string
     */
    private function extractWebsiteDomainFromContacts($contacts)
    {
        foreach ($contacts as $contact) {
            if (isset($contact->Email)) {
                $domain = $this->extractDomainFromEmail($contact->Email);

                if ($domain) {
                    return $domain;
                }
            }
        }

        return null;
    }

    private function extractDomainFromEmail($email)
    {
        if (preg_match('/^.*@([^@]+)$$/', $email, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
