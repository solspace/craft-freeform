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

namespace Solspace\Freeform\Integrations\CRM\Salesforce\Versions;

use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\Salesforce\BaseSalesforceIntegration;
use yii\base\Event;

#[Type(
    name: 'Salesforce v58',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class SalesforceV58 extends BaseSalesforceIntegration
{
    private const CATEGORY_LEAD = 'Lead';
    private const CATEGORY_OPPORTUNITY = 'Opportunity';
    private const CATEGORY_ACCOUNT = 'Account';
    private const CATEGORY_CONTACT = 'Contact';

    private const API_VERSION = 'v58.0';

    #[Input\Boolean(
        label: 'Assign Lead Owner?',
        instructions: 'Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules.',
    )]
    protected bool $assignLeadOwner = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Using custom URL?',
        instructions: 'Enable this if you connect to your Salesforce account with a custom company URL (e.g. \'mycompany.my.salesforce.com\').'
    )]
    protected bool $usingCustomUrl = false;

    // ==========================================
    //                   Leads
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Leads?',
        instructions: 'Should map to leads?',
    )]
    protected bool $mapLeads = false;

    #[VisibilityFilter('values.mapLeads')]
    #[Input\Boolean(
        label: 'Convert Leads to Contact Tasks for Returning Customers?',
        instructions: 'When a Salesforce Contact already exists with the same email address, create a new Task for the Contact instead of a new Lead.',
    )]
    protected bool $convertLeadsToTasks = false;

    #[VisibilityFilter('values.mapLeads')]
    #[VisibilityFilter('values.convertLeadsToTasks')]
    #[Input\Text(
        instructions: "Enter the text you'd like to have set for new Task subjects.",
    )]
    protected string $taskSubject = '';

    #[VisibilityFilter('values.mapLeads')]
    #[VisibilityFilter('values.convertLeadsToTasks')]
    #[Input\Text(
        instructions: "Enter a relative textual date string for the Due Date of the newly created Task (e.g. '2 days').",
    )]
    protected string $taskDueDate = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Lead fields',
        source: 'api/integrations/crm/fields/'.self::CATEGORY_LEAD,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Opportunities?',
        instructions: 'Should map to opportunities?',
    )]
    protected bool $mapOpportunities = false;

    #[VisibilityFilter('values.mapOpportunities')]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. \'7 days\').',
    )]
    protected string $closeDate = '';

    #[VisibilityFilter('values.mapOpportunities')]
    #[Validators\Required]
    #[Input\Text(
        label: 'Stage Name',
        instructions: 'Enter the Stage Name the newly created Opportunity should be assigned to (e.g. \'Prospecting\').',
    )]
    protected string $stage = '';

    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Contact update?',
        instructions: 'If a Contact already exists in Salesforce, enabling this will append additional checkbox group field values to the Contact inside Salesforce, instead of overwriting the options.',
    )]
    protected bool $appendContactData = false;

    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Account update?',
        instructions: 'If an Account already exists in Salesforce, enabling this will append additional checkbox group field values to the Account inside Salesforce, instead of overwriting the options.',
    )]
    protected bool $appendAccountData = false;

    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Boolean(
        label: 'Check Contact email address and Account website when checking for duplicates?',
        instructions: 'By default, Freeform will check against Contact first name, last name and email address, as well as and Account name. If enabled, Freeform will instead check against Contact email address only and Account website. If no website is mapped, Freeform will gather the website domain from the Contact email address mapped.',
    )]
    protected bool $duplicateCheck = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Opportunity fields',
        source: 'api/integrations/crm/fields/'.self::CATEGORY_OPPORTUNITY,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $opportunityMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Account fields',
        source: 'api/integrations/crm/fields/'.self::CATEGORY_ACCOUNT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $accountMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Account fields',
        source: 'api/integrations/crm/fields/'.self::CATEGORY_CONTACT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $dataUrl = '';

    public function push(Form $form): bool
    {
        $client = $this->generateAuthorizedClient();

        $keyValueList = $this->processMapping($form, $this->leadMapping, self::CATEGORY_LEAD);

        if ($this->createTasksForDuplicates($client, $keyValueList)) {
            return true;
        }

        $leadResult = $this->processLeads($client, $keyValueList);
        // $opportunityResult = $this->processOpportunities($form, $client);

        return true;
    }

    public function getApiRootUrl(): string
    {
        $instance = $this->instanceUrl;
        $usingCustomUrls = $this->usingCustomUrl;

        if (!str_starts_with($instance, 'https://')) {
            return sprintf(
                'https://%s%s.salesforce.com/services/data/'.self::API_VERSION.'/',
                $instance,
                $usingCustomUrls ? '.my' : ''
            );
        }

        return $instance.'/services/data/'.self::API_VERSION.'/';
    }

    protected function getAuthorizationCheckUrl(): string
    {
        return $this->getEndpoint('/sobjects/Lead/describe');
    }

    private function isCreateTasksForDuplicates(): bool
    {
        return $this->convertLeadsToTasks;
    }

    private function createTasksForDuplicates(Client $client, array $keyValueList): bool
    {
        // Check for existing clients
        if ($this->isCreateTasksForDuplicates() && isset($keyValueList['Email'])) {
            $email = $keyValueList['Email'];

            $contact = $this->querySingle(
                "SELECT Id, Email, OwnerId FROM Contact WHERE Email = '%s' LIMIT 1",
                [$email]
            );

            if ($contact) {
                $description = '';
                foreach ($formFields as $field) {
                    $description .= "{$field->getLabel()}: {$field->getValueAsString()}\n";
                }

                try {
                    $dueDate = $this->taskDueDate ?: '+2 days';
                    $dueDate = new Carbon($dueDate, 'UTC');
                } catch (\Exception $e) {
                    $dueDate = new Carbon('+2 days', 'UTC');
                    $this->getLogger()->error($e->getMessage());
                }
                $subject = $this->taskSubject ?: 'New Followup';

                $payload = [
                    'Subject' => $subject,
                    'WhoId' => $contact->Id,
                    'Description' => $description,
                    'ActivityDate' => $dueDate->toDateString(),
                ];

                if ($contact->OwnerId) {
                    $payload['OwnerId'] = $contact->OwnerId;
                }

                try {
                    $endpoint = $this->getEndpoint('/sobjects/Task');
                    $response = $client->post($endpoint, ['json' => $payload]);

                    if (201 === $response->getStatusCode()) {
                        return true;
                    }
                } catch (RequestException $exception) {
                }
            }
        }

        return false;
    }

    private function processLeads(Client $client, array $keyValueList): bool
    {
        $endpoint = $this->getEndpoint('/sobjects/Lead');

        try {
            $response = $client->post(
                $endpoint,
                [
                    'headers' => ['Sforce-Auto-Assign' => $this->assignLeadOwner ? 'TRUE' : 'FALSE'],
                    'json' => $keyValueList,
                ]
            );

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_LEAD, $response)
            );

            return 201 === $response->getStatusCode();
        } catch (RequestException $e) {
            return $this->handleRequestException($e);
        }
    }

    private function processOpportunities(Form $form, Client $client): bool
    {
        $keyValueList = $this->processMapping($form, $this->opportunityMapping, self::CATEGORY_OPPORTUNITY);

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

    private function handleRequestException(RequestException $exception): bool
    {
        $exceptionResponse = $exception->getResponse();
        if (!$exceptionResponse) {
            $this->getLogger()->error($exception->getMessage(), ['exception' => $exception->getMessage()]);

            throw $exception;
        }

        $responseBody = (string) $exceptionResponse->getBody();
        $this->getLogger()->error($responseBody, ['exception' => $exception->getMessage()]);

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

        throw $exception;
    }
}
