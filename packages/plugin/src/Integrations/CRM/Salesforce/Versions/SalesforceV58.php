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
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\Salesforce\BaseSalesforceIntegration;
use Solspace\Freeform\Integrations\CRM\Salesforce\SalesforceIntegrationInterface;
use yii\base\Event;

#[Type(
    name: 'Salesforce (v58)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class SalesforceV58 extends BaseSalesforceIntegration implements SalesforceIntegrationInterface
{
    protected const API_VERSION = 'v58.0';

    // ==========================================
    //                   Leads
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Leads',
        instructions: 'Should map to the Leads endpoint.',
        order: 4,
    )]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Boolean(
        label: 'Assign Lead Owner',
        instructions: 'Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules.',
        order: 5,
    )]
    protected bool $assignLeadOwner = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Boolean(
        label: 'Convert Leads to Contact Tasks for Returning Customers',
        instructions: 'When a Salesforce Contact already exists with the same email address, create a new Task for the Contact instead of a new Lead.',
        order: 6,
    )]
    protected bool $convertLeadsToTasks = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[VisibilityFilter('values.convertLeadsToTasks')]
    #[Input\Text(
        instructions: "Enter the text you'd like to have set for new Task subjects.",
        order: 7,
    )]
    protected string $taskSubject = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[VisibilityFilter('values.convertLeadsToTasks')]
    #[Input\Text(
        instructions: "Enter a relative textual date string for the Due Date of the newly created Task (e.g. '2 days').",
        order: 8,
    )]
    protected string $taskDueDate = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Lead fields',
        order: 9,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_LEAD,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    // ==========================================
    //               Opportunities
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Opportunities',
        instructions: 'Should map to the Opportunities endpoint.',
        order: 10,
    )]
    protected bool $mapOpportunities = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter a relative textual date string for the Close Date of the newly created Opportunity (e.g. \'7 days\').',
        order: 11,
    )]
    protected string $closeDate = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Validators\Required]
    #[Input\Text(
        label: 'Stage Name',
        instructions: 'Enter the Stage Name the newly created Opportunity should be assigned to (e.g. \'Prospecting\').',
        order: 12,
    )]
    protected string $stage = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Opportunity fields',
        order: 13,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_OPPORTUNITY,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $opportunityMapping = null;

    // ==========================================
    //                  Accounts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Accounts',
        instructions: 'Should map to the Accounts endpoint.',
        order: 14,
    )]
    protected bool $mapAccounts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapAccounts')]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Account update',
        instructions: 'If an Account already exists in Salesforce, enabling this will append additional checkbox group field values to the Account inside Salesforce, instead of overwriting the options.',
        order: 15,
    )]
    protected bool $appendAccountData = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapAccounts')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Account fields',
        order: 16,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_ACCOUNT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $accountMapping = null;

    // ==========================================
    //                  Contacts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Contacts',
        instructions: 'Should map to the Contacts endpoint.',
        order: 17,
    )]
    protected bool $mapContacts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapContacts')]
    #[Input\Boolean(
        label: 'Check Contact email address and Account website when checking for duplicates?',
        instructions: 'By default, Freeform will check against Contact first name, last name and email address, as well as and Account name. If enabled, Freeform will instead check against Contact email address only and Account website. If no website is mapped, Freeform will gather the website domain from the Contact email address mapped.',
        order: 18,
    )]
    protected bool $duplicateCheck = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapContacts')]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Contact update?',
        instructions: 'If a Contact already exists in Salesforce, enabling this will append additional checkbox group field values to the Contact inside Salesforce, instead of overwriting the options.',
        order: 19,
    )]
    protected bool $appendContactData = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapContacts')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Salesforce Account fields',
        order: 20,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_CONTACT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    private ?string $accountId = null;

    public function getApiRootUrl(): string
    {
        return $this->getInstanceUrl().'/services/data/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): bool
    {
        $this->processLeads($form, $client);
        $this->processAccounts($form, $client);
        $this->processContacts($form, $client);
        $this->processOpportunities($form, $client);

        return true;
    }

    public function getTaskSubject(): string
    {
        return $this->getProcessedValue($this->taskSubject);
    }

    public function getTaskDueDate(): string
    {
        return $this->getProcessedValue($this->taskDueDate);
    }

    public function getCloseDate(): string
    {
        return $this->getProcessedValue($this->closeDate);
    }

    public function getStage(): string
    {
        return $this->getProcessedValue($this->stage);
    }

    private function isCreateTasksForDuplicates(): bool
    {
        return $this->convertLeadsToTasks;
    }

    private function createTasksForDuplicates(Form $form, Client $client, array $keyValueList): bool
    {
        // Check for existing clients
        if ($this->isCreateTasksForDuplicates() && isset($keyValueList['Email'])) {
            $email = $keyValueList['Email'];

            $contact = $this->querySingle(
                $client,
                "SELECT Id, Email, OwnerId FROM Contact WHERE Email = '%s' LIMIT 1",
                [$email]
            );

            if ($contact) {
                $description = '';
                foreach ($form->getLayout()->getFields()->getStorableFields() as $field) {
                    $description .= "{$field->getLabel()}: {$field->getValueAsString()}\n";
                }

                try {
                    $dueDate = $this->getTaskDueDate() ?: '+2 days';
                    $dueDate = new Carbon($dueDate, 'UTC');
                } catch (\Exception $exception) {
                    $dueDate = new Carbon('+2 days', 'UTC');

                    $this->processException($exception, self::LOG_CATEGORY);
                }
                $subject = $this->getTaskSubject() ?: 'New Followup';

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
                    $response = $client->post(
                        $this->getEndpoint('/sobjects/Task'),
                        ['json' => $payload],
                    );

                    return 201 === $response->getStatusCode();
                } catch (\Exception $exception) {
                    $this->processException($exception, self::LOG_CATEGORY);
                }
            }
        }

        return false;
    }

    private function processLeads(Form $form, Client $client): void
    {
        if (!$this->mapLeads) {
            return;
        }

        $mapping = $this->processMapping($form, $this->leadMapping, self::CATEGORY_LEAD);
        if (!$mapping) {
            return;
        }

        if ($this->createTasksForDuplicates($form, $client, $mapping)) {
            return;
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/sobjects/Lead'),
                [
                    'headers' => [
                        'Sforce-Auto-Assign' => $this->assignLeadOwner ? 'TRUE' : 'FALSE',
                    ],
                    'json' => $mapping,
                ]
            );

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_LEAD, $response)
            );
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }

    private function processAccounts(Form $form, Client $client): void
    {
        if (!$this->mapAccounts) {
            return;
        }

        $contactMapping = $this->processMapping($form, $this->contactMapping, self::CATEGORY_CONTACT);

        $mapping = $this->processMapping($form, $this->accountMapping, self::CATEGORY_ACCOUNT);

        if (!$mapping) {
            return;
        }

        $appendAccountFields = [];

        foreach ($this->accountMapping as $item) {
            if (FieldMapItem::TYPE_RELATION === $item->getType()) {
                $field = $form->get($item->getValue());

                if ($field instanceof CheckboxesField) {
                    $appendAccountFields[] = $item->getSource();
                }
            }
        }

        $accountName = $mapping['Name'] ?? null;
        $accountWebsite = $mapping['Website'] ?? null;
        $contactFirstName = $contactMapping['FirstName'] ?? null;
        $contactLastName = $contactMapping['LastName'] ?? null;
        $contactEmail = $contactMapping['Email'] ?? null;
        $contactName = trim("{$contactFirstName} {$contactLastName}");

        if (empty($accountName)) {
            $accountName = $contactName;
            $mapping['Name'] = $accountName;
        }

        // We'll query
        $appendAccountFieldsQuery = '';

        // Check if contact has an email which we can use to get account website
        if ($this->duplicateCheck && !$accountWebsite && $contactEmail) {
            $accountWebsite = $this->extractDomainFromEmail($contactEmail);

            if ($accountWebsite) {
                $mapping['Website'] = $accountWebsite;
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
        if ($this->duplicateCheck) {
            if ($accountWebsite) {
                // We'll search for an account with account website
                $accountRecord = $this->querySingle(
                    $client,
                    'SELECT Id'.$appendAccountFieldsQuery." FROM Account WHERE Website = '%s' ORDER BY CreatedDate desc LIMIT 1",
                    [$accountWebsite],
                );
            }
        } else {
            $accountRecord = $this->querySingle(
                $client,
                'SELECT Id'.$appendAccountFieldsQuery." FROM Account WHERE Name = '%s' ORDER BY CreatedDate desc LIMIT 1",
                [$accountName],
            );
        }

        try {
            if ($accountRecord) {
                // We'll prepare appendable values
                if ($this->appendAccountData) {
                    $mapping = $this->appendValues($mapping, $accountRecord, $appendAccountFields);
                }

                $response = $client->patch(
                    $this->getEndpoint('/sobjects/Account/'.$accountRecord->Id),
                    ['json' => $mapping],
                );

                $this->accountId = $accountRecord->Id;
            } else {
                $response = $client->post(
                    $this->getEndpoint('/sobjects/Account'),
                    ['json' => $mapping],
                );

                $json = json_decode((string) $response->getBody());

                $this->accountId = $json->id;
            }

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_ACCOUNT, $response)
            );
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }

    private function processContacts(Form $form, Client $client): void
    {
        if (!$this->mapContacts) {
            return;
        }

        $mapping = $this->processMapping($form, $this->contactMapping, self::CATEGORY_CONTACT);
        if (!$mapping) {
            return;
        }

        $isAppendContactData = $this->appendContactData;

        $appendContactFields = [];

        foreach ($this->contactMapping as $item) {
            if (FieldMapItem::TYPE_RELATION === $item->getType()) {
                $field = $form->get($item->getValue());

                if ($field instanceof CheckboxesField) {
                    $appendContactFields[] = $item->getSource();
                }
            }
        }

        $contactFirstName = $mapping['FirstName'] ?? null;
        $contactLastName = $mapping['LastName'] ?? null;
        $contactEmail = $mapping['Email'] ?? null;
        $contactName = trim("{$contactFirstName} {$contactLastName}");

        $appendFieldsQuery = '';
        if ($appendContactFields) {
            $appendFieldsQuery = ', '.implode(', ', $appendContactFields).' ';
        }

        $contactRecord = null;
        if (!empty($contactEmail)) {
            $contactRecord = $this->querySingle(
                $client,
                'SELECT Id'.$appendFieldsQuery." FROM Contact WHERE Email = '%s' ORDER BY CreatedDate desc LIMIT 1",
                [$contactEmail],
            );
        }

        if (!$contactRecord) {
            $contactRecord = $this->querySingle(
                $client,
                'SELECT Id'.$appendFieldsQuery." FROM Contact WHERE Name = '%s' ORDER BY CreatedDate desc LIMIT 1",
                [$contactName],
            );
        }

        if ($this->accountId) {
            $mapping['AccountId'] = $this->accountId;
        }

        try {
            if ($contactRecord) {
                // We'll prepare appendable values
                if ($isAppendContactData) {
                    $mapping = $this->appendValues($mapping, $contactRecord, $appendContactFields);
                }

                $response = $client->patch(
                    $this->getEndpoint('/sobjects/Contact/'.$contactRecord->Id),
                    ['json' => $mapping],
                );
            } else {
                $response = $client->post(
                    $this->getEndpoint('/sobjects/Contact'),
                    ['json' => $mapping],
                );
            }

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_CONTACT, $response)
            );
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }

    private function processOpportunities(Form $form, Client $client): void
    {
        if (!$this->mapOpportunities) {
            return;
        }

        $mapping = $this->processMapping($form, $this->opportunityMapping, self::CATEGORY_OPPORTUNITY);
        if (!$mapping) {
            return;
        }

        try {
            $closeDate = new Carbon($this->closeDate);
        } catch (\Exception $e) {
            $closeDate = new Carbon();
        }

        try {
            $mapping['CloseDate'] = $closeDate->toIso8601ZuluString();
            $mapping['StageName'] = $this->getStage();
            if ($this->accountId) {
                $mapping['AccountId'] = $this->accountId;
            }

            $response = $client->post(
                $this->getEndpoint('/sobjects/Opportunity'),
                ['json' => $mapping],
            );

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_OPPORTUNITY, $response)
            );
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }

    private function extractDomainFromEmail(string $email): ?string
    {
        if (preg_match('/^.*@([^@]+)$$/', $email, $matches)) {
            return $matches[1];
        }

        return null;
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
}
