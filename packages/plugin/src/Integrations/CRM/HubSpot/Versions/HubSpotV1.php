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

namespace Solspace\Freeform\Integrations\CRM\HubSpot\Versions;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\HubSpot\BaseHubSpotIntegration;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Type(
    name: 'HubSpot (v1)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class HubSpotV1 extends BaseHubSpotIntegration
{
    // ==========================================
    //                  Deals
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Deals?',
        instructions: 'Should map to deals',
        order: 5,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Deal fields',
        order: 6,
        source: 'api/integrations/crm/fields/Deal',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    // ==========================================
    //                 Contacts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Contacts?',
        instructions: 'Should map to contacts',
        order: 7,
    )]
    protected bool $mapContacts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapContacts)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Contacts fields',
        order: 8,
        source: 'api/integrations/crm/fields/Contact',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    // ==========================================
    //                Companies
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Companies?',
        instructions: 'Should map to companies',
        order: 9,
    )]
    protected bool $mapCompanies = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapCompanies)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Company fields',
        order: 10,
        source: 'api/integrations/crm/fields/Company',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $companyMapping = null;

    private array $dealProps = [];

    private array $contactProps = [];

    private array $companyProps = [];

    private array $appendContactFields = [];

    private array $appendCompanyFields = [];

    private ?int $companyId = null;

    private ?string $companyName = null;

    private ?int $contactId = null;

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/contacts/v1/lists/all/contacts/all'));

            $json = json_decode((string) $response->getBody(), false);

            return !empty($json->contacts);
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(string $category, Client $client): array
    {
        $record = 'deals';

        if ('Contact' === $category) {
            $record = 'contacts';
        } elseif ('Company' === $category) {
            $record = 'companies';
        }

        try {
            $response = $client->get($this->getEndpoint('/properties/v1/'.$record.'/properties'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        if (empty($json)) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        foreach ($json as $field) {
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

            $fieldList[] = new FieldObject(
                $field->name,
                $field->label,
                $type,
                $category,
                false,
            );
        }

        return $fieldList;
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.hubapi.com';
    }

    public function push(Form $form, Client $client): bool
    {
        $this->setProps($form);
        $this->processDeals($client);

        return true;
    }

    private function setProps(Form $form): void
    {
        if ($this->mapDeals) {
            $mapping = $this->processMapping($form, $this->dealMapping, 'Deal');
            if (!$mapping) {
                return;
            }

            $formFields = [];

            foreach ($this->dealMapping as $fieldMapping) {
                if ('' === $fieldMapping->getValue()) {
                    continue;
                }

                $formFields[$fieldMapping->getSource()] = $form->getLayout()->getField($fieldMapping->getValue());
            }

            foreach ($mapping as $key => $value) {
                $value = $this->formatValue($value, $formFields[$key]);

                $this->dealProps[] = ['value' => $value, 'name' => $key];
            }
        }

        if ($this->mapContacts) {
            $mapping = $this->processMapping($form, $this->contactMapping, 'Contact');
            if (!$mapping) {
                return;
            }

            $formFields = [];

            foreach ($this->contactMapping as $fieldMapping) {
                if ('' === $fieldMapping->getValue()) {
                    continue;
                }

                $formFields[$fieldMapping->getSource()] = $form->getLayout()->getField($fieldMapping->getValue());
            }

            foreach ($mapping as $key => $value) {
                $value = $this->formatValue($value, $formFields[$key]);

                $this->contactProps[] = ['value' => $value, 'property' => $key];

                if ($this->getAppendContactData()) {
                    if (isset($formFields[$key])) {
                        if ($this->isAppendFieldType($formFields[$key])) {
                            $this->appendContactFields[] = $key;
                        }
                    }
                }
            }
        }

        if ($this->mapCompanies) {
            $mapping = $this->processMapping($form, $this->companyMapping, 'Company');
            if (!$mapping) {
                return;
            }

            $formFields = [];

            foreach ($this->companyMapping as $fieldMapping) {
                if ('' === $fieldMapping->getValue()) {
                    continue;
                }

                $formFields[$fieldMapping->getSource()] = $form->getLayout()->getField($fieldMapping->getValue());
            }

            foreach ($mapping as $key => $value) {
                $value = $this->formatValue($value, $formFields[$key]);

                $this->companyProps[] = ['value' => $value, 'name' => $key];

                if ($this->getAppendCompanyData()) {
                    if (isset($formFields[$key])) {
                        if ($this->isAppendFieldType($formFields[$key])) {
                            $this->appendCompanyFields[] = $key;
                        }
                    }
                }
            }
        }
    }

    private function processDeals(Client $client): void
    {
        if (!$this->mapDeals) {
            return;
        }

        $contactEmail = $this->getEmailFieldValue($this->contactProps);

        if ($this->companyProps) {
            try {
                $companyDomain = $this->getDomainFieldValue($this->companyProps);

                if (!$companyDomain && $contactEmail) {
                    $companyDomain = $this->extractDomainFromEmail($contactEmail);

                    if ($companyDomain) {
                        $this->companyProps = $this->addCompanyDomainToCompanyProps($companyDomain, $this->companyProps);
                    }
                }

                if ($companyDomain) {
                    $queryProperties = ['domain'];

                    if ($this->appendCompanyFields) {
                        $queryProperties = array_merge($queryProperties, $this->appendCompanyFields);
                    }

                    $response = $this->getCompanyByDomain($companyDomain, $client, $queryProperties);

                    $json = json_decode((string) $response->getBody());

                    if (\count($json->results) > 0) {
                        $company = $json->results[0];

                        if (isset($company->companyId)) {
                            $this->companyId = $company->companyId;
                        }

                        if ($this->appendCompanyFields && isset($company->properties)) {
                            $this->companyProps = $this->appendValuesToCompanyProperties($this->companyProps, $this->appendCompanyFields, $company);
                        }
                    }
                }

                if ($this->companyId) {
                    $response = $this->updateCompanyById($this->companyId, $client, $this->companyProps);
                } else {
                    $response = $this->createCompany($client, $this->companyProps);
                }

                $json = json_decode((string) $response->getBody());

                if (isset($json->companyId)) {
                    $this->companyId = $json->companyId;
                }

                if (isset($json->properties->name->value)) {
                    $this->companyName = $json->properties->name->value;
                }
            } catch (\Exception $exception) {
                $this->processException($exception, self::LOG_CATEGORY);
            }
        }

        if ($this->contactProps) {
            if ($this->getIpField() && isset($_SERVER['REMOTE_ADDR'])) {
                $this->contactProps[] = [
                    'value' => $_SERVER['REMOTE_ADDR'],
                    'property' => $this->getIpField(),
                ];
            }

            try {
                if ($contactEmail) {
                    $response = $this->getContactByEmail($contactEmail, $client, $this->appendContactFields);

                    $json = json_decode((string) $response->getBody());

                    if (isset($json->vid)) {
                        $this->contactId = $json->vid;
                    }
                }

                if ($this->companyName) {
                    $this->contactProps = $this->addValueToContactProps('company', $this->companyName, $this->contactProps);
                }

                if ($this->contactId) {
                    if ($this->appendContactFields) {
                        if (isset($json->properties)) {
                            $this->contactProps = $this->appendValuesToContactProperties($this->contactProps, $this->appendContactFields, $json);
                        }
                    }

                    $response = $this->updateContactByEmail($contactEmail, $client, $this->contactProps);
                } else {
                    $response = $this->createContact($client, $this->contactProps);
                }

                $json = json_decode((string) $response->getBody());

                if (isset($json->vid)) {
                    $this->contactId = $json->vid;
                }
            } catch (RequestException $exception) {
                if ($exception->getResponse()) {
                    $json = json_decode((string) $exception->getResponse()->getBody());

                    if (isset($json->status, $json->message)) {
                        if ('error' === $json->status && 'contact does not exist' === $json->message) {
                            $response = $this->createContact($client, $this->contactProps);

                            $json = json_decode((string) $response->getBody());

                            if (isset($json->vid)) {
                                $this->contactId = $json->vid;
                            }
                        } else {
                            $this->processException($exception, self::LOG_CATEGORY);
                        }
                    } elseif (isset($json->error, $json->identityProfile) && 'CONTACT_EXISTS' === $json->error) {
                        $this->contactId = $json->identityProfile->vid;
                    } else {
                        $this->processException($exception, self::LOG_CATEGORY);
                    }
                }
            } catch (\Exception $exception) {
                $this->processException($exception, self::LOG_CATEGORY);
            }
        }

        if (!empty($this->dealProps)) {
            $deal = [
                'properties' => $this->dealProps,
            ];

            if ($this->companyId || $this->contactId) {
                $deal['associations'] = [];

                if ($this->companyId) {
                    $deal['associations']['associatedCompanyIds'] = [
                        $this->companyId,
                    ];
                }

                if ($this->contactId) {
                    $deal['associations']['associatedVids'] = [
                        $this->contactId,
                    ];
                }
            }

            $client->post(
                $this->getEndpoint('/deals/v1/deal'),
                [
                    'json' => $deal,
                ],
            );
        }
    }

    private function isAppendFieldType(mixed $formField): bool
    {
        if ($formField instanceof CheckboxesField) {
            return true;
        }

        return false;
    }

    private function formatValue(mixed $value, mixed $formField): mixed
    {
        $isMultiCheckbox = $this->isAppendFieldType($formField);
        if ($isMultiCheckbox) {
            $value = str_replace(', ', ';', $value);
        }

        return $value;
    }

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

    private function getCompanyByDomain(string $companyDomain, Client $client, array $queryProperties): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/companies/v2/domains/'.$companyDomain.'/companies'),
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
            ],
        );
    }

    private function appendValuesToCompanyProperties(array $companyProps, array $appendCompanyFields, \stdClass $company): array
    {
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

    private function updateCompanyById(int $companyId, Client $client, array $companyProps): ResponseInterface
    {
        return $client->put(
            $this->getEndpoint('/companies/v2/companies/'.$companyId),
            [
                'json' => [
                    'properties' => $companyProps,
                ],
            ],
        );
    }

    private function createCompany(Client $client, array $companyProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/companies/v2/companies'),
            [
                'json' => [
                    'properties' => $companyProps,
                ],
            ],
        );
    }

    private function getContactByEmail(string $email, Client $client, array $contactProps): ResponseInterface
    {
        return $client->get(
            $this->getEndpoint('/contacts/v1/contact/email/'.$email.'/profile'),
            [
                'json' => [
                    'properties' => $contactProps,
                ],
            ],
        );
    }

    private function updateContactByEmail(string $email, Client $client, array $contactProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/contacts/v1/contact/email/'.$email.'/profile'),
            [
                'json' => [
                    'properties' => $contactProps,
                ],
            ],
        );
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

    private function appendValuesToContactProperties(array $contactProps, array $appendContactFields, array $contact): array
    {
        foreach ($contactProps as $key => $contactProp) {
            $contactPropValue = $contactProp['value'];
            $contactPropName = $contactProp['property'];

            if (\in_array($contactPropName, $appendContactFields)) {
                if (isset($contact->properties->{$contactPropName}->value) && $contact->properties->{$contactPropName}->value) {
                    if ($contactPropValue) {
                        $newCompanyPropValue = $contact->properties->{$contactPropName}->value.';'.$contactPropValue;
                    } else {
                        $newCompanyPropValue = $contact->properties->{$contactPropName}->value;
                    }

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

    private function createContact(Client $client, array $contactProps): ResponseInterface
    {
        return $client->post(
            $this->getEndpoint('/contacts/v1/contact'),
            [
                'json' => [
                    'properties' => $contactProps,
                ],
            ],
        );
    }
}
