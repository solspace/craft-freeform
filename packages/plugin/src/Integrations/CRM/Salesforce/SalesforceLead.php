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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Type(
    name: 'Salesforce - Leads',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class SalesforceLead extends BaseSalesforceIntegration
{
    public const LOG_CATEGORY = 'Salesforce';

    #[Input\Boolean(
        label: 'Assign Lead Owner?',
        instructions: 'Enabling this will make Salesforce assign a lead owner based on lead owner assignment rules.',
    )]
    protected bool $assignLeadOwner = false;

    #[Input\Boolean(
        label: 'Using custom URL?',
        instructions: 'Enable this if you connect to your Salesforce account with a custom company URL (e.g. \'mycompany.my.salesforce.com\').'
    )]
    protected bool $usingCustomUrl = false;

    #[Input\Boolean(
        label: 'Convert Leads to Contact Tasks for Returning Customers?',
        instructions: 'When a Salesforce Contact already exists with the same email address, create a new Task for the Contact instead of a new Lead.',
    )]
    protected bool $convertLeadsToTasks = false;

    #[Input\Text(
        instructions: "Enter the text you'd like to have set for new Task subjects.",
    )]
    protected string $taskSubject = '';

    #[Input\Text(
        instructions: "Enter a relative textual date string for the Due Date of the newly created Task (e.g. '2 days').",
    )]
    protected string $taskDueDate = '';

    /**
     * Push objects to the CRM.
     *
     * @param null|AbstractField[] $formFields
     *
     * @throws IntegrationException
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $client = $this->generateAuthorizedClient();

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

        $endpoint = $this->getEndpoint('/sobjects/Lead');
        $keyValueList = array_filter($keyValueList);

        try {
            $response = $client->post(
                $endpoint,
                [
                    'headers' => ['Sforce-Auto-Assign' => $this->assignLeadOwner ? 'TRUE' : 'FALSE'],
                    'json' => $keyValueList,
                ]
            );

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

        try {
            $response = $client->get($this->getEndpoint('/sobjects/Lead/describe'));
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }

        $data = json_decode((string) $response->getBody());

        $fieldList = [];
        foreach ($data->fields as $field) {
            if (!$field->updateable) {
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
                case 'reference':
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

    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field): mixed
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    public function getApiRootUrl(): string
    {
        $instance = $this->instanceUrl;
        $usingCustomUrls = $this->usingCustomUrl;

        if (!str_starts_with($instance, 'https://')) {
            return sprintf(
                'https://%s%s.salesforce.com/services/data/v44.0/',
                $instance,
                $usingCustomUrls ? '.my' : ''
            );
        }

        return $instance.'/services/data/v44.0/';
    }

    protected function getAuthorizationCheckUrl(): string
    {
        return $this->getEndpoint('/sobjects/Lead/describe');
    }

    private function isCreateTasksForDuplicates(): bool
    {
        return $this->convertLeadsToTasks;
    }
}
