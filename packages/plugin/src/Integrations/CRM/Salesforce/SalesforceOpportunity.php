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
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Form\Form;

#[Type(
    name: 'Salesforce - Opportunity',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class SalesforceOpportunity extends BaseSalesforceIntegration
{
    public const LOG_CATEGORY = 'Salesforce';

    public const FIELD_CATEGORY_OPPORTUNITY = 'opportunity';
    public const FIELD_CATEGORY_ACCOUNT = 'account';
    public const FIELD_CATEGORY_CONTACT = 'contact';

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
    public function push(Form $form): bool
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

    public function getApiRootUrl(): string
    {
        return $this->getInstanceUrl().$this->getDataUrl();
    }

    protected function getAuthorizationCheckUrl(): string
    {
        return $this->getEndpoint('/sobjects/Opportunity/describe');
    }

    private function isAppendFieldType(mixed $formField): bool
    {
        return $formField instanceof CheckboxesField;
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
