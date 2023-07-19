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

namespace Solspace\Freeform\Integrations\CRM\HubSpot;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Type(
    name: 'HubSpot',
    iconPath: __DIR__.'/icon.svg',
)]
class HubSpot extends CRMIntegration
{
    public const LOG_CATEGORY = 'HubSpot';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your HubSpot API key here.',
    )]
    protected string $apiKey = '';

    #[Input\Text(
        label: 'IP Address Field',
        instructions: "Enter a custom HubSpot Contact field handle where you wish to store the client's IP address from the submission (optional).",
    )]
    protected string $ipField = '';

    #[Input\Boolean(
        label: 'Append checkbox group field values on Contact update?',
        instructions: 'If a Contact already exists in HubSpot, enabling this will append additional checkbox group field values to the Contact inside HubSpot, instead of overwriting the options.',
    )]
    protected bool $appendContactData = false;

    #[Input\Boolean(
        label: 'Append checkbox group field values on Company update?',
        instructions: 'If a Company already exists in HubSpot, enabling this will append additional checkbox group field values to the Company inside HubSpot, instead of overwriting the options.',
    )]
    protected bool $appendCompanyData = false;

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function getIpField(): string
    {
        return $this->getProcessedValue($this->ipField);
    }

    public function getAppendContactData(): bool
    {
        return $this->appendContactData;
    }

    public function getAppendCompanyData(): bool
    {
        return $this->appendCompanyData;
    }

    public function initiateAuthentication(): void
    {
    }

    /**
     * Push objects to the CRM.
     *
     * @param array $formFields
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $isAppendContactData = $this->getAppendContactData();
        $isAppendCompanyData = $this->getAppendCompanyData();

        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/deals/v1/deal/');

        $dealProps = [];
        $contactProps = [];
        $companyProps = [];
        $appendContactFields = [];
        $appendCompanyFields = [];

        foreach ($keyValueList as $key => $value) {
            preg_match('/^(\w+)___(.+)$/', $key, $matches);

            [$all, $target, $propName] = $matches;

            $value = $this->formatValue($value, $formFields[$key]);

            switch ($target) {
                case 'contact':
                    $contactProps[] = ['value' => $value, 'property' => $propName];

                    // Checks which contact's values we'll need to append to an existing HS values based on a form field type
                    if ($isAppendContactData) {
                        if (isset($formFields[$key])) {
                            if ($this->isAppendFieldType($formFields[$key])) {
                                $appendContactFields[] = $propName;
                            }
                        }
                    }

                    break;

                case 'company':
                    $companyProps[] = ['value' => $value, 'name' => $propName];

                    // Checks which company's values we'll need to append to an existing HS values based on a form field type
                    if ($isAppendCompanyData) {
                        if (isset($formFields[$key])) {
                            if ($this->isAppendFieldType($formFields[$key])) {
                                $appendCompanyFields[] = $propName;
                            }
                        }
                    }

                    break;

                case 'deal':
                    $dealProps[] = ['value' => $value, 'name' => $propName];

                    break;
            }
        }

        $companyId = null;
        $companyName = null;

        // Gets posted email address

        $contactEmail = $this->getEmailFieldValue($contactProps);

        if ($companyProps) {
            try {
                // Gets posted company domain address
                $companyDomain = $this->getDomainFieldValue($companyProps);

                if (!$companyDomain && $contactEmail) {
                    $companyDomain = $this->extractDomainFromEmail($contactEmail);

                    if ($companyDomain) {
                        $companyProps = $this->addCompanyDomainToCompanyProps($companyDomain, $companyProps);
                    }
                }

                // Queries for a Company record based on the domain
                if ($companyDomain) {
                    $queryProperties = ['domain'];

                    // We have to query appendable fields so later we can update our company props
                    if ($appendCompanyFields) {
                        $queryProperties = array_merge($queryProperties, $appendCompanyFields);
                    }

                    $response = $this->getCompanyByDomain($companyDomain, $client, $queryProperties);

                    $json = json_decode((string) $response->getBody());

                    // If we've found a company based on the domain name
                    if (\count($json->results) > 0) {
                        $company = $json->results[0];

                        if (isset($company->companyId)) {
                            $companyId = $company->companyId;
                        }

                        // We'll append appendable values
                        if ($appendCompanyFields && isset($company->properties)) {
                            $companyProps = $this->appendValuesToCompanyProperties($companyProps, $appendCompanyFields, $company);
                        }
                    }
                }

                // If we found a company based on the domain
                if ($companyId) {
                    // We'll update it
                    $response = $this->updateCompanyById($companyId, $client, $companyProps);
                } else {
                    // Or we'll create a new company
                    $response = $this->createCompany($client, $companyProps);
                }

                $json = json_decode((string) $response->getBody());
                if (isset($json->companyId)) {
                    $companyId = $json->companyId;
                }

                if (isset($json->properties->name->value)) {
                    $companyName = $json->properties->name->value;
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();

                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        $contactId = null;

        if ($contactProps) {
            if ($this->getIpField() && isset($_SERVER['REMOTE_ADDR'])) {
                $contactProps[] = [
                    'value' => $_SERVER['REMOTE_ADDR'],
                    'property' => $this->getIpField(),
                ];
            }

            try {
                // If we have an email value posted through the form
                if ($contactEmail) {
                    // We'll query for an existing contact by email
                    $response = $this->getContactByEmail($contactEmail, $client, $appendContactFields);

                    $json = json_decode((string) $response->getBody());
                    if (isset($json->vid)) {
                        $contactId = $json->vid;
                    }
                }

                if ($companyName) {
                    $contactProps = $this->addValueToContactProps('company', $companyName, $contactProps);
                }

                // If there is a record with the posted email
                if ($contactId) {
                    // We'll update mapped contact values with appendable values
                    if ($appendContactFields) {
                        if (isset($json->properties)) {
                            $contactProps = $this->appendValuesToContactProperties($contactProps, $appendContactFields, $json);
                        }
                    }

                    // We'll update contact by email
                    $response = $this->updateContactByEmail($contactEmail, $client, $contactProps);
                } else {
                    // Or we'll create a new contact
                    $response = $this->createContact($client, $contactProps);
                }

                $json = json_decode((string) $response->getBody());
                if (isset($json->vid)) {
                    $contactId = $json->vid;
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                if ($e->getResponse()) {
                    $json = json_decode((string) $e->getResponse()->getBody());

                    if (isset($json->status, $json->message)) {
                        // If finding a contact by email was unsuccessful it's defined as an error so we'll create a new contact then
                        if ('error' === $json->status && 'contact does not exist' === $json->message) {
                            $response = $this->createContact($client, $contactProps);

                            $json = json_decode((string) $response->getBody());
                            if (isset($json->vid)) {
                                $contactId = $json->vid;
                            }

                            $this->getHandler()->onAfterResponse($this, $response);
                        } else {
                            $responseBody = (string) $e->getResponse()->getBody();

                            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
                        }
                    } elseif (isset($json->error, $json->identityProfile) && 'CONTACT_EXISTS' === $json->error) {
                        $contactId = $json->identityProfile->vid;
                    } else {
                        $responseBody = (string) $e->getResponse()->getBody();

                        $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
                    }
                }
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        if (!empty($dealProps)) {
            $deal = [
                'properties' => $dealProps,
            ];

            if ($companyId || $contactId) {
                $deal['associations'] = [];

                if ($companyId) {
                    $deal['associations']['associatedCompanyIds'] = [$companyId];
                }

                if ($contactId) {
                    $deal['associations']['associatedVids'] = [$contactId];
                }
            }

            $response = $client->post($endpoint, ['json' => $deal]);

            $this->getHandler()->onAfterResponse($this, $response);

            return 200 === $response->getStatusCode();
        }

        return true;
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/contacts/v1/lists/all/contacts/all');

        try {
            $response = $client->get($endpoint);

            $json = json_decode((string) $response->getBody(), true);

            return isset($json['contacts']);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $fieldList = [];
        $this->extractCustomFields(
            '/properties/v1/deals/properties/',
            'deal',
            $fieldList
        );

        $this->extractCustomFields(
            '/properties/v1/contacts/properties/',
            'contact',
            $fieldList
        );

        $this->extractCustomFields(
            '/properties/v1/companies/properties/',
            'company',
            $fieldList
        );

        return $fieldList;
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'query' => ['hapikey' => $this->getApiKey()],
        ]);
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.hubapi.com/';
    }

    private function extractCustomFields(string $endpoint, string $dataType, array &$fieldList)
    {
        $client = $this->generateAuthorizedClient();
        $response = $client->get($this->getEndpoint($endpoint));

        $data = json_decode((string) $response->getBody());

        foreach ($data as $field) {
            if ($field->readOnlyValue || $field->hidden || $field->calculated) {
                continue;
            }

            $type = null;

            switch ($field->type) {
                case 'string':
                case 'enumeration':
                case 'phone_number':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'datetime':
                case 'date':
                    $type = FieldObject::TYPE_MICROTIME;

                    break;

                case 'bool':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'number':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $dataLabel = ucfirst($dataType);
            $fieldObject = new FieldObject(
                $dataType.'___'.$field->name,
                $field->label." ({$dataLabel})",
                $type,
                false
            );

            $fieldList[] = $fieldObject;
        }
    }

    /**
     * Get posted email value.
     *
     * @param mixed $contactProps
     *
     * @return string
     */
    private function getEmailFieldValue(array $contactProps): mixed
    {
        foreach ($contactProps as $contactProp) {
            if (isset($contactProp['property'])) {
                if ('email' === $contactProp['property']) {
                    if (isset($contactProp['value'])) {
                        return $contactProp['value'];
                    }
                }
            }
        }

        return false;
    }

    /**
     * Get's posted domain value.
     *
     * @param mixed $companyProps
     *
     * @return string
     */
    private function getDomainFieldValue(array $companyProps): mixed
    {
        foreach ($companyProps as $companyProp) {
            if (isset($companyProp['name'])) {
                if ('domain' === $companyProp['name']) {
                    if (isset($companyProp['value'])) {
                        return $companyProp['value'];
                    }
                }
            }
        }

        return false;
    }

    /**
     * Checks if Form field's type calls for a value append.
     */
    private function isAppendFieldType(mixed $formField): bool
    {
        if ($formField instanceof CheckboxesField) {
            return true;
        }

        return false;
    }

    private function getContactByEmail(string $email, Client $client, array $contactProps): ResponseInterface
    {
        return $client->get(
            $this->getEndpoint('/contacts/v1/contact/email/'.$email.'/profile'),
            ['json' => ['properties' => $contactProps]]
        );
    }

    private function updateContactByEmail(string $email, Client $client, array $contactProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/contacts/v1/contact/email/'.$email.'/profile'),
            ['json' => ['properties' => $contactProps]]
        );
    }

    private function getCompanyByDomain(string $companyDomain, Client $client, array $queryProperties): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('companies/v2/domains/'.$companyDomain.'/companies'),
            [
                'json' => [
                    'limit' => 1,
                    'requestOptions' => [
                        'properties' => $queryProperties,
                    ],
                    'offset' => [
                        'isPrimary' => true,
                        'companyId' => 0,
                    ],
                ],
            ]
        );
    }

    private function updateCompanyById(int $companyId, Client $client, array $companyProps): ResponseInterface
    {
        return $client->put(
            $this->getEndpoint('companies/v2/companies/'.$companyId),
            ['json' => ['properties' => $companyProps]]
        );
    }

    private function createCompany(Client $client, array $companyProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('companies/v2/companies'),
            ['json' => ['properties' => $companyProps]]
        );
    }

    private function createContact(Client $client, array $contactProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/contacts/v1/contact'),
            ['json' => ['properties' => $contactProps]]
        );
    }

    private function appendValuesToCompanyProperties(
        array $companyProps,
        array $appendCompanyFields,
        \stdClass $company
    ): array {
        foreach ($companyProps as $key => $companyProp) {
            $companyPropValue = $companyProp['value'];
            $companyPropName = $companyProp['name'];

            if (\in_array($companyPropName, $appendCompanyFields)) {
                if (isset($company->properties->{$companyPropName}->value) && $company->properties->{$companyPropName}->value) {
                    if ($companyPropValue) {
                        $newCompanyPropValue = $company->properties->{$companyPropName}->value.';'.$companyPropValue;
                    } else {
                        $newCompanyPropValue = $company->properties->{$companyPropName}->value;
                    }

                    // Clean up duplicate values
                    $valueArray = explode(';', $newCompanyPropValue);
                    $valueArray = array_unique($valueArray);
                    $newCompanyPropValue = implode(';', $valueArray);

                    $companyProps[$key] = [
                        'value' => $newCompanyPropValue,
                        'name' => $companyPropName,
                    ];
                }
            }
        }

        return $companyProps;
    }

    private function appendValuesToContactProperties(
        array $contactProps,
        array $appendContactFields,
        array $contact
    ): array {
        foreach ($contactProps as $key => $contactProp) {
            $contactPropValue = $contactProp['value'];
            $contactPropName = $contactProp['property'];

            // We are appending appendable values based on newly posted values and current record values
            if (\in_array($contactPropName, $appendContactFields)) {
                if (isset($contact->properties->{$contactPropName}->value) && $contact->properties->{$contactPropName}->value) {
                    if ($contactPropValue) {
                        $newCompanyPropValue = $contact->properties->{$contactPropName}->value.';'.$contactPropValue;
                    } else {
                        $newCompanyPropValue = $contact->properties->{$contactPropName}->value;
                    }

                    // Clean up duplicate values
                    $valueArray = explode(';', $newCompanyPropValue);
                    $valueArray = array_unique($valueArray);
                    $newCompanyPropValue = implode(';', $valueArray);

                    $contactProps[$key] = [
                        'value' => $newCompanyPropValue,
                        'property' => $contactPropName,
                    ];
                }
            }
        }

        return $contactProps;
    }

    private function extractDomainFromEmail($email): ?string
    {
        if (preg_match('/^.*@([^@]+)$$/', $email, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function addCompanyDomainToCompanyProps(string $companyDomain, array $companyProps): array
    {
        foreach ($companyProps as $key => $companyProp) {
            $companyPropName = $companyProp['name'];

            if ('domain' == $companyPropName) {
                $companyProps[$key] = [
                    'value' => $companyDomain,
                    'name' => $companyPropName,
                ];

                return $companyProps;
            }
        }

        $companyProps[] = [
            'value' => $companyDomain,
            'name' => 'domain',
        ];

        return $companyProps;
    }

    private function addValueToContactProps(string $searchPropName, mixed $value, array $contactProps): array
    {
        foreach ($contactProps as $key => $contactProp) {
            $propName = $contactProp['property'];

            if ($propName == $searchPropName) {
                $contactProps[$key] = [
                    'value' => $value,
                    'property' => $searchPropName,
                ];

                return $contactProps;
            }
        }

        $contactProps[] = [
            'value' => $value,
            'property' => $searchPropName,
        ];

        return $contactProps;
    }

    private function formatValue(mixed $value, mixed $formField): mixed
    {
        $isMultiCheckbox = $this->isAppendFieldType($formField);

        if ($isMultiCheckbox) {
            $value = str_replace(', ', ';', $value);
        }

        return $value;
    }
}
