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

namespace Solspace\Freeform\Integrations\CRM\Zoho\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;

#[Type(
    name: 'Zoho (v2)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class ZohoV2 extends BaseZohoV2Integration
{
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Text(
        label: 'Default Contact Role ID',
        order: 3,
    )]
    protected ?string $defaultContactRoleId = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Leads',
        instructions: 'Should map to leads?',
        order: 4,
    )]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapLeads)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Zoho Lead fields',
        order: 5,
        source: 'api/integrations/crm/fields/Lead',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Deals',
        instructions: 'Should map to deals?',
        order: 6,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Zoho Deals fields',
        order: 7,
        source: 'api/integrations/crm/fields/Deal',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Account',
        instructions: 'Should map to account?',
        order: 8,
    )]
    protected bool $mapAccount = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapAccount)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Zoho Account fields',
        order: 9,
        source: 'api/integrations/crm/fields/Account',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $accountMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Contact',
        instructions: 'Should map to contact?',
        order: 10,
    )]
    protected bool $mapContact = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapAccount)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Zoho Contact fields',
        order: 11,
        source: 'api/integrations/crm/fields/Contact',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    private ?int $contactId = null;

    private ?int $dealId = null;

    public function getApiRootUrl(): string
    {
        $url = 'https://www.zohoapis.com';

        $apiDomain = $this->getApiDomain();
        if ($apiDomain) {
            $url = $apiDomain;
        }

        if ($this->isSandboxMode()) {
            $url = 'https://sandbox.zohoapis.'.$this->getLocation();
        }

        if ($this->isDeveloperMode()) {
            $url = 'https://developer.zohoapis.'.$this->getLocation();
        }

        $url = rtrim($url, '/');

        return $url.'/crm/'.self::API_VERSION;
    }

    public function push(Form $form): bool
    {
        $client = $this->generateAuthorizedClient();

        $this->processLeads($form, $client);
        $this->processAccount($form, $client);
        $this->processContact($form, $client);
        $this->processDeals($form, $client);

        return true;
    }

    protected function getDefaultContactRoleId(): ?string
    {
        return $this->defaultContactRoleId;
    }

    private function processLeads(Form $form, Client $client): void
    {
        if (!$this->mapLeads) {
            return;
        }

        $mapping = $this->processMapping($form, $this->leadMapping, 'Lead');
        if (!$mapping) {
            return;
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/Leads'),
                [
                    'json' => [
                        'data' => [
                            $mapping,
                        ],
                    ],
                ],
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->processZohoResponseError($json);
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function processAccount(Form $form, Client $client): void
    {
        if (!$this->mapAccount) {
            return;
        }

        $mapping = $this->processMapping($form, $this->accountMapping, 'Account');
        if (!$mapping) {
            return;
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/Accounts/upsert'),
                [
                    'json' => [
                        'data' => [
                            $mapping,
                        ],
                        'duplicate_check_fields' => [
                            'Account_Name',
                        ],
                    ],
                ],
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->processZohoResponseError($json);
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function processContact(Form $form, Client $client): void
    {
        if (!$this->mapContact) {
            return;
        }

        $mapping = $this->processMapping($form, $this->contactMapping, 'Contact');
        if (!$mapping) {
            return;
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/Contacts/upsert'),
                [
                    'json' => [
                        'data' => [
                            $mapping,
                        ],
                        'duplicate_check_fields' => [
                            'Email',
                        ],
                    ],
                ],
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->processZohoResponseError($json);

            if (isset($json['data'][0]['details']['id'])) {
                $this->contactId = $json['data'][0]['details']['id'];
            }
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function processDeals(Form $form, Client $client): void
    {
        if (!$this->mapDeals) {
            return;
        }

        $mapping = $this->processMapping($form, $this->dealMapping, 'Deal');
        if (!$mapping) {
            return;
        }

        $mapping['Stage'] = 'Qualification';

        try {
            $response = $client->post(
                $this->getEndpoint('/Deals'),
                [
                    'json' => [
                        'data' => [
                            $mapping,
                        ],
                    ],
                ],
            );

            $json = json_decode((string) $response->getBody(), true);

            $this->processZohoResponseError($json);

            if (isset($json['data'][0]['details']['id'])) {
                $this->dealId = $json['data'][0]['details']['id'];
            }

            if ($this->dealId && $this->contactId) {
                $response = $client->put(
                    $this->getEndpoint('/Contacts/'.$this->contactId.'/Deals/'.$this->dealId),
                    [
                        'json' => [
                            'data' => [
                                [
                                    'Contact_Role' => $this->getDefaultContactRoleId(),
                                ],
                            ],
                        ],
                    ],
                );

                $json = json_decode((string) $response->getBody(), true);

                $this->processZohoResponseError($json);
            }
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }
}
