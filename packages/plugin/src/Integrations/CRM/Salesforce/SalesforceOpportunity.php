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

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use Carbon\Carbon;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\CheckboxGroupField;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Type(
    name: 'Salesforce - Opportunity',
    iconPath: __DIR__.'/icon.svg',
)]
class SalesforceOpportunity extends BaseSalesforceIntegration
{
    public const LOG_CATEGORY = 'Salesforce';

    public const FIELD_CATEGORY_OPPORTUNITY = 'opportunity';
    public const FIELD_CATEGORY_ACCOUNT = 'account';
    public const FIELD_CATEGORY_CONTACT = 'contact';

    #[Property(
        instructions: 'Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. \'7 days\').',
        required: true,
    )]
    protected string $closeDate = '';

    #[Property(
        label: 'Stage Name',
        instructions: 'Enter the Stage Name the newly created Opportunity should be assigned to (e.g. \'Prospecting\').',
        required: true,
    )]
    protected string $stage = '';

    #[Property(
        label: 'Append checkbox group field values on Contact update?',
        instructions: 'If a Contact already exists in Salesforce, enabling this will append additional checkbox group field values to the Contact inside Salesforce, instead of overwriting the options.',
    )]
    protected bool $appendContactData = false;

    #[Property(
        label: 'Append checkbox group field values on Account update?',
        instructions: 'If an Account already exists in Salesforce, enabling this will append additional checkbox group field values to the Account inside Salesforce, instead of overwriting the options.',
    )]
    protected bool $appendAccountData = false;

    #[Property(
        label: 'Check Contact email address and Account website when checking for duplicates?',
        instructions: 'By default, Freeform will check against Contact first name, last name and email address, as well as and Account name. If enabled, Freeform will instead check against Contact email address only and Account website. If no website is mapped, Freeform will gather the website domain from the Contact email address mapped.',
    )]
    protected bool $duplicateCheck = false;

    #[Flag(self::FLAG_INTERNAL)]
    #[Property]
    protected string $dataUrl = '';

    public function getCloseDate(): string
    {
        return $this->getProcessedValue($this->closeDate);
    }

    public function getStage(): string
    {
        return $this->getProcessedValue($this->stage);
    }

    public function isAppendContactData(): bool
    {
        return $this->appendContactData;
    }

    public function isAppendAccountData(): bool
    {
        return $this->appendAccountData;
    }

    public function isDuplicateCheck(): bool
    {
        return $this->duplicateCheck;
    }

    public function getDataUrl(): string
    {
        return $this->dataUrl;
    }

    /**
     * Push objects to the CRM.
     *
     * @param array $formFields
     *
     * @throws \Exception
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $isAppendContactData = $this->isAppendContactData();
        $isAppendAccountData = $this->isAppendAccountData();
        $domainDuplicateCheck = $this->isDuplicateCheck();

        $appendContactFields = [];
        $appendAccountFields = [];

        $opportunityMapping = $accountMapping = $contactMapping = [];
        foreach ($keyValueList as $key => $value) {
            if (empty($value) || !preg_match('/^(\w+)___(.*)$/', $key, $matches)) {
                continue;
            }

            [$_, $category, $handle] = $matches;

            switch ($category) {
                case self::FIELD_CATEGORY_OPPORTUNITY:
                    $opportunityMapping[$handle] = $value;

                    break;

                case self::FIELD_CATEGORY_ACCOUNT:
                    $accountMapping[$handle] = $value;

                    // Checks which account's values we'll need to append to an existing SF value based on a form field type
                    if ($isAppendAccountData) {
                        if (isset($formFields[$key])) {
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
                        if (isset($formFields[$key])) {
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
            $closeDate = new Carbon($this->getCloseDate());
        } catch (\Exception $e) {
            $closeDate = new Carbon();
        }

        $accountName = $accountMapping['Name'] ?? null;
        $accountWebsite = $accountMapping['Website'] ?? null;
        $contactFirstName = $contactMapping['FirstName'] ?? null;
        $contactLastName = $contactMapping['LastName'] ?? null;
        $contactEmail = $contactMapping['Email'] ?? null;
        $contactName = trim("{$contactFirstName} {$contactLastName}");
        if (empty($accountName)) {
            $accountName = $contactName;
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
            $appendAccountFieldsQuery = ', '.implode(', ', $appendAccountFields).' ';
        }

        $accountRecord = null;

        // If the advanced mapping is enabled and we have an account website which we can use for a search
        if ($domainDuplicateCheck) {
            if ($accountWebsite) {
                // We'll search for an account with account website
                $accountRecord = $this->querySingle(
                    'SELECT Id'.$appendAccountFieldsQuery."
                    FROM Account
                    WHERE Website = '%s'
                    ORDER BY CreatedDate desc
                    LIMIT 1",
                    [$accountWebsite]
                );
            }
        } else {
            $accountRecord = $this->querySingle(
                'SELECT Id'.$appendAccountFieldsQuery."
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
            $appendFieldsQuery = ', '.implode(', ', $appendContactFields).' ';
        }

        $contactRecord = null;
        if (!empty($contactEmail)) {
            $contactRecord = $this->querySingle(
                'SELECT Id'.$appendFieldsQuery."
                FROM Contact
                WHERE Email = '%s'
                ORDER BY CreatedDate desc
                LIMIT 1",
                [$contactEmail]
            );
        }

        if (!$contactRecord) {
            $contactRecord = $this->querySingle(
                'SELECT Id'.$appendFieldsQuery."
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

                $accountEndpoint = $this->getEndpoint('/sobjects/Account/'.$accountRecord->Id);
                $response = $client->patch($accountEndpoint, ['json' => $accountMapping]);
                $accountId = $accountRecord->Id;
                $this->getHandler()->onAfterResponse($this, $response);
            } else {
                $accountEndpoint = $this->getEndpoint('/sobjects/Account');
                $accountResponse = $client->post($accountEndpoint, ['json' => $accountMapping]);
                $accountId = json_decode($accountResponse->getBody())->id;
                $this->getHandler()->onAfterResponse($this, $accountResponse);
            }

            $contactMapping['AccountId'] = $accountId;

            if ($contactRecord) {
                // We'll prepare appendable values
                if ($isAppendContactData) {
                    $contactMapping = $this->appendValues($contactMapping, $contactRecord, $appendContactFields);
                }

                $contactEndpoint = $this->getEndpoint('/sobjects/Contact/'.$contactRecord->Id);
                $response = $client->patch($contactEndpoint, ['json' => $contactMapping]);
                $this->getHandler()->onAfterResponse($this, $response);
            } else {
                $contactEndpoint = $this->getEndpoint('/sobjects/Contact');
                $response = $client->post($contactEndpoint, ['json' => $contactMapping]);
                $this->getHandler()->onAfterResponse($this, $response);
            }

            $opportunityMapping['CloseDate'] = $closeDate->toIso8601ZuluString();
            $opportunityMapping['AccountId'] = $accountId;
            $opportunityMapping['StageName'] = $this->getStage();

            $response = $client->post($this->getEndpoint('/sobjects/Opportunity'), ['json' => $opportunityMapping]);
            $this->getHandler()->onAfterResponse($this, $response);

            return 201 === $response->getStatusCode();
        } catch (RequestException $e) {
            $exceptionResponse = $e->getResponse();
            if (!$exceptionResponse) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

                throw $e;
            }

            $responseBody = (string) $exceptionResponse->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            if (400 === $exceptionResponse->getStatusCode()) {
                $errors = json_decode((string) $exceptionResponse->getBody());

                if (\is_array($errors)) {
                    foreach ($errors as $error) {
                        if ('REQUIRED_FIELD_MISSING' === strtoupper($error->errorCode)) {
                            return false;
                        }
                    }
                }
            }

            throw $e;
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
                $response = $client->get($this->getEndpoint("/sobjects/{$endpoint}/describe"));
            } catch (RequestException $e) {
                $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

                continue;
            }

            $data = json_decode((string) $response->getBody());

            foreach ($data->fields as $field) {
                if (!$field->updateable || !empty($field->referenceTo)) {
                    continue;
                }

                if ('StageName' === $field->name) {
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
                    $category.'___'.$field->name,
                    $field->label." ({$endpoint})",
                    $type,
                    !$field->nillable
                );

                $fieldList[] = $fieldObject;
            }
        }

        return $fieldList;
    }

    /**
     * @return array|bool|string
     */
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field): mixed
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    /**
     * @throws CRMIntegrationNotFoundException
     */
    protected function onAfterFetchAccessToken(\stdClass $responseData)
    {
        parent::onAfterFetchAccessToken($responseData);

        if (!isset($responseData->instance_url)) {
            return;
        }

        $client = $this->generateAuthorizedClient();
        $endpoint = $responseData->instance_url.'/services/data';

        $response = $client->get($endpoint);
        $data = json_decode((string) $response->getBody());

        $latestVersion = array_pop($data);

        $this->dataUrl = $latestVersion->url;
    }

    protected function getAuthorizationCheckUrl(): string
    {
        return $this->getEndpoint('/sobjects/Opportunity/describe');
    }

    protected function getApiRootUrl(): string
    {
        return $this->getInstanceUrl().$this->getDataUrl();
    }

    private function isAppendFieldType(mixed $formField): bool
    {
        return $formField instanceof CheckboxGroupField;
    }

    /**
     * Goes through all of the mapped values, checks which values have to be appended and appends them to the record's
     * values.
     */
    private function appendValues(array $mappedValues, mixed $record, array $appendFields): array
    {
        foreach ($mappedValues as $fieldHandle => $value) {
            if (\in_array($fieldHandle, $appendFields)) {
                if (isset($record->{$fieldHandle}) && $record->{$fieldHandle}) {
                    if ($value) {
                        $mappedValues[$fieldHandle] = $record->{$fieldHandle}.';'.$value;
                    } else {
                        $mappedValues[$fieldHandle] = $record->{$fieldHandle};
                    }

                    // Clean up duplicate values
                    $valueArray = explode(';', $mappedValues[$fieldHandle]);
                    $valueArray = array_unique($valueArray);
                    $mappedValues[$fieldHandle] = implode(';', $valueArray);
                }
            }
        }

        return $mappedValues;
    }

    private function extractDomainFromEmail(string $email): ?string
    {
        if (preg_match('/^.*@([^@]+)$$/', $email, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
