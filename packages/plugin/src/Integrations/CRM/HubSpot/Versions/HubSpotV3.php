<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM\HubSpot\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\HubSpot\BaseHubSpotIntegration;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

#[Type(
    name: 'HubSpot',
    type: Type::TYPE_CRM,
    version: 'v3',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class HubSpotV3 extends BaseHubSpotIntegration
{
    // ==========================================
    //                  Deals
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Deals',
        instructions: 'Should map to the Deals endpoint.',
        order: 5,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Deal fields',
        order: 6,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_DEAL,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    // ==========================================
    //                 Contacts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Contacts',
        instructions: 'Should map to the Contacts endpoint.',
        order: 7,
    )]
    protected bool $mapContacts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mapContacts)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Contacts fields',
        order: 8,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_CONTACT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    // ==========================================
    //                Companies
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map to Companies',
        instructions: 'Should map to the Companies endpoint.',
        order: 9,
    )]
    protected bool $mapCompanies = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mapCompanies)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable HubSpot Company fields',
        order: 10,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_COMPANY,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $companyMapping = null;

    private ?int $companyId = null;
    private ?int $contactId = null;
    private ?int $dealId = null;

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/objects/contacts'));

        $json = json_decode((string) $response->getBody(), false);

        return 200 === $response->getStatusCode() && isset($json->results);
    }

    public function fetchFields(string $category, Client $client): array
    {
        $record = $this->getRecord($category);

        try {
            $response = $client->get($this->getEndpoint('/properties/'.$record));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());
        if (empty($json)) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];
        foreach ($json->results as $field) {
            $isReadOnly = $field->modificationMetadata->readOnlyValue;
            $isHidden = $field->hidden;
            $isCalculated = $field->calculated;

            if ($isReadOnly || $isHidden || $isCalculated) {
                continue;
            }

            $type = match ($field->type) {
                'string', 'phone_number' => FieldObject::TYPE_STRING,
                'datetime', 'date' => FieldObject::TYPE_MICROTIME,
                'bool' => FieldObject::TYPE_BOOLEAN,
                'number' => FieldObject::TYPE_NUMERIC,
                'enumeration' => FieldObject::TYPE_ARRAY,
                default => null,
            };

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
        return 'https://api.hubapi.com/crm/v3';
    }

    public function push(Form $form, Client $client): bool
    {
        $this->pushContacts($form, $client);
        $this->pushCompanies($form, $client);
        $this->pushDeals($form, $client);

        $this->createAssociations($form, $client);

        return true;
    }

    private function pushContacts(Form $form, Client $client): void
    {
        if (!$this->mapContacts) {
            return;
        }

        $mapping = $this->processMapping($form, $this->contactMapping, self::CATEGORY_CONTACT);
        if (!$mapping) {
            return;
        }

        if ($this->getIpField() && isset($_SERVER['REMOTE_ADDR'])) {
            $mapping[$this->getIpField()] = $_SERVER['REMOTE_ADDR'];
        }

        $email = $this->getEmailFieldValue($mapping);
        $contact = $this->searchForObject(
            $client,
            $this->getRecord(self::CATEGORY_CONTACT),
            ['email' => $email],
            $this->getMappedProps($this->contactMapping)
        );

        try {
            if ($contact) {
                $contactId = $contact->id;

                if ($this->getAppendContactData()) {
                    $mapping = $this->appendValues(
                        self::CATEGORY_CONTACT,
                        $mapping,
                        (array) $contact->properties
                    );
                }

                $response = $client->patch(
                    $this->getEndpoint('/objects/contacts/'.$contactId),
                    ['json' => ['properties' => $mapping]],
                );
            } else {
                [$response, $data] = $this->getJsonResponse(
                    $client->post(
                        $this->getEndpoint('/objects/contacts'),
                        ['json' => ['properties' => $mapping]],
                    )
                );

                $contactId = $data->id;
            }

            $this->triggerAfterResponseEvent(self::CATEGORY_CONTACT, $response);
        } catch (\Exception $exception) {
            $this->processException($exception, self::CATEGORY_CONTACT);
        }

        $this->contactId = $contactId;
    }

    private function pushCompanies(Form $form, Client $client): void
    {
        if (!$this->mapCompanies) {
            return;
        }

        $mapping = $this->processMapping($form, $this->companyMapping, self::CATEGORY_COMPANY);
        if (!$mapping) {
            return;
        }

        $domain = $this->getDomainFieldValue($mapping);
        if (!$domain) {
            $website = $mapping['website'] ?? null;
            if ($website) {
                $domain = $this->extractDomainFromUrl($website);
            }

            if (!$domain) {
                $contactProps = $this->processMapping($form, $this->contactMapping, self::CATEGORY_CONTACT);
                $email = $this->getEmailFieldValue($contactProps);

                if ($email) {
                    $domain = $this->extractDomainFromEmail($email);

                    if ($domain) {
                        $mapping['domain'] = $domain;
                    }
                }
            }
        }

        $company = $this->searchForObject(
            $client,
            $this->getRecord(self::CATEGORY_COMPANY),
            ['domain' => $domain],
            $this->getMappedProps($this->companyMapping)
        );

        try {
            if ($company) {
                $companyId = $company->id;

                // Prevent the customer from updating company name if it's an existing company
                unset($mapping['name']);

                if ($this->getAppendCompanyData()) {
                    $mapping = $this->appendValues(
                        self::CATEGORY_COMPANY,
                        $mapping,
                        (array) $company->properties
                    );
                }

                $response = $client->patch(
                    $this->getEndpoint('/objects/companies/'.$companyId),
                    ['json' => ['properties' => $mapping]],
                );
            } else {
                [$response, $data] = $this->getJsonResponse(
                    $client->post(
                        $this->getEndpoint('/objects/companies'),
                        ['json' => ['properties' => $mapping]],
                    )
                );

                $companyId = $data->id;
            }

            $this->triggerAfterResponseEvent(self::CATEGORY_COMPANY, $response);
        } catch (\Exception $exception) {
            $this->processException($exception, self::CATEGORY_COMPANY);
        }

        $this->companyId = $companyId;
    }

    private function pushDeals(Form $form, Client $client): void
    {
        if (!$this->mapDeals) {
            return;
        }

        $properties = $this->processMapping($form, $this->dealMapping, self::CATEGORY_DEAL);
        if (!$properties) {
            return;
        }

        try {
            [$response, $data] = $this->getJsonResponse(
                $client->post(
                    $this->getEndpoint('/objects/deals'),
                    ['json' => ['properties' => $properties]],
                )
            );

            $this->dealId = $data->id;

            $this->triggerAfterResponseEvent(self::CATEGORY_DEAL, $response);
        } catch (\Exception $exception) {
            $this->processException($exception, self::CATEGORY_DEAL);
        }
    }

    private function createAssociations(Form $form, Client $client): void
    {
        $dealId = $this->dealId;
        $companyId = $this->companyId;
        $contactId = $this->contactId;

        $base = 'https://api.hubapi.com/crm/v4/objects';

        if ($companyId) {
            $endpoint = $base.'/company/'.$companyId.'/associations/default';
            if ($dealId) {
                $client->put($endpoint."/deal/{$dealId}");
            }

            if ($contactId) {
                $client->put($endpoint."/contact/{$contactId}");
            }
        }

        if ($contactId) {
            $endpoint = $base.'/contact/'.$contactId.'/associations/default';
            if ($companyId) {
                $client->put($endpoint."/company/{$companyId}");
            }

            if ($dealId) {
                $client->put($endpoint."/deal/{$dealId}");
            }
        }

        if ($dealId) {
            $endpoint = $base.'/deal/'.$dealId.'/associations/default';
            if ($companyId) {
                $client->put($endpoint."/company/{$companyId}");
            }

            if ($contactId) {
                $client->put($endpoint."/contact/{$contactId}");
            }
        }
    }

    private function getEmailFieldValue(array $properties): ?string
    {
        return $properties['email'] ?? null;
    }

    private function getDomainFieldValue(array $companyProps): ?string
    {
        return $companyProps['domain'] ?? null;
    }

    private function extractDomainFromEmail(string $email): ?string
    {
        if (preg_match('/^.*@([^@]+)$/', $email, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private function extractDomainFromUrl(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        $domain = str_ireplace('www.', '', parse_url($url, \PHP_URL_HOST));
        if (!$domain) {
            return null;
        }

        return $domain;
    }

    private function searchForObject(
        Client $client,
        string $record,
        array $searchMap,
        array $properties
    ): ?\stdClass {
        $filters = [];
        foreach ($searchMap as $key => $value) {
            if (!$value) {
                continue;
            }

            $filters[] = [
                'propertyName' => $key,
                'operator' => 'EQ',
                'value' => $value,
            ];
        }

        if (empty($filters)) {
            return null;
        }

        try {
            [, $data] = $this->getJsonResponse(
                $client->post(
                    $this->getEndpoint("/objects/{$record}/search"),
                    [
                        'json' => [
                            'properties' => $properties,
                            'filterGroups' => [['filters' => $filters]],
                            'limit' => 1,
                        ],
                    ],
                )
            );

            if ($data->total > 0) {
                return $data->results[0];
            }
        } catch (\Exception $exception) {
            $this->processException($exception, self::CATEGORY_CONTACT);
        }

        return null;
    }

    private function appendValues(string $category, array $mapping, array $originalValues): array
    {
        $fieldDefinitions = $this->getProcessableFields($category);

        foreach ($mapping as $handle => $value) {
            $definition = $fieldDefinitions[$handle] ?? null;
            if (FieldObject::TYPE_ARRAY !== $definition?->getType()) {
                continue;
            }

            $original = explode(';', $originalValues[$handle] ?? '');

            $value = explode(';', $value);
            $value = array_merge($value, $original);
            $value = array_filter($value);
            $value = array_unique($value);
            $value = implode(';', $value);

            $mapping[$handle] = $value;
        }

        return $mapping;
    }

    private function getRecord(string $category): string
    {
        return match ($category) {
            self::CATEGORY_CONTACT => 'contacts',
            self::CATEGORY_COMPANY => 'companies',
            default => 'deals',
        };
    }

    private function getMappedProps(FieldMapping $mapping): array
    {
        return array_map(
            fn (FieldMapItem $item) => $item->getSource(),
            $mapping->getMapping()
        );
    }
}
