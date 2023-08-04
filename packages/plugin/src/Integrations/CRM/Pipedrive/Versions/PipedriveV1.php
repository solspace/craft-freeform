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

namespace Solspace\Freeform\Integrations\CRM\Pipedrive\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\Pipedrive\BasePipedriveIntegration;
use Solspace\Freeform\Integrations\CRM\Pipedrive\PipedriveIntegrationInterface;

#[Type(
    name: 'Pipedrive (v1)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class PipedriveV1 extends BasePipedriveIntegration implements PipedriveIntegrationInterface
{
    protected const API_VERSION = 'v1';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Leads',
        instructions: 'Should map to leads',
        order: 3,
    )]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapLeads)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Pipedrive Lead fields',
        order: 4,
        source: 'api/integrations/crm/fields/Deal',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Deals',
        instructions: 'Should map to deals?',
        order: 5,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Text(
        label: 'Stage ID',
        instructions: 'Enter the Pipedrive Stage ID you want the deal to be placed in.',
        order: 6,
    )]
    protected ?int $stageId = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Pipedrive Deal fields',
        order: 7,
        source: 'api/integrations/crm/fields/Deal',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Organization',
        instructions: 'Should map to organization?',
        order: 8,
    )]
    protected bool $mapOrganization = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapOrganization)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Pipedrive Organization fields',
        order: 9,
        source: 'api/integrations/crm/fields/Organization',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $organizationMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map Person',
        instructions: 'Should map to person?',
        order: 10,
    )]
    protected bool $mapPerson = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapPerson)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Pipedrive Person fields',
        order: 11,
        source: 'api/integrations/crm/fields/Person',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $personMapping = null;

    private ?int $organizationId = null;

    private ?int $personId = null;

    private ?string $leadId = null;

    private ?int $dealId = null;

    public function getApiRootUrl(): string
    {
        $url = 'https://api.pipedrive.com';

        $apiDomain = $this->getApiDomain();
        if ($apiDomain) {
            $url = $apiDomain;
        }

        $url = rtrim($url, '/');

        return $url.'/api/'.self::API_VERSION.'/';
    }

    public function push(Form $form): bool
    {
        $client = $this->generateAuthorizedClient();

        $this->processOrganization($form, $client);
        $this->processPerson($form, $client);
        $this->processLeads($form, $client);
        $this->processDeals($form, $client);

        return true;
    }

    protected function getStageId(): ?int
    {
        return $this->getProcessedValue($this->stageId);
    }

    private function processOrganization(Form $form, Client $client): void
    {
        if (!$this->mapOrganization) {
            return;
        }

        $mapping = $this->processMapping($form, $this->organizationMapping, 'Organization');
        if (!$mapping) {
            return;
        }

        try {
            $userId = $this->getUserId();
            if ($userId) {
                $mapping['owner_id'] = $userId;
            }

            $organizationId = $this->searchForDuplicate(
                $client,
                [
                    'name' => $mapping['name'] ?? null,
                ],
                'organization',
            );

            if ($organizationId) {
                $this->organizationId = $organizationId;
            }

            $response = $client->post(
                $this->getEndpoint('/organizations'),
                [
                    'json' => $mapping,
                ],
            );

            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                $this->organizationId = (int) $json->data->id;
            }
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function processPerson(Form $form, Client $client): void
    {
        if (!$this->mapPerson) {
            return;
        }

        $mapping = $this->processMapping($form, $this->personMapping, 'Person');
        if (!$mapping) {
            return;
        }

        $personId = $this->searchForDuplicate(
            $client,
            [
                'email' => $mapping['email'] ?? null,
            ],
            'person',
        );

        try {
            $userId = $this->getUserId();
            if ($userId) {
                $mapping['owner_id'] = $userId;
            }

            if ($this->organizationId) {
                $mapping['org_id'] = $this->organizationId;
            }

            if ($personId) {
                unset($mapping['email']);

                $response = $client->put(
                    $this->getEndpoint('/persons/'.$personId),
                    [
                        'json' => $mapping,
                    ],
                );
            } else {
                $response = $client->post(
                    $this->getEndpoint('/persons'),
                    [
                        'json' => $mapping,
                    ],
                );
            }

            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                $this->personId = (int) $json->data->id;
            }
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
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
            $userId = $this->getUserId();
            if ($userId) {
                $mapping['owner_id'] = $userId;
            }

            if ($this->personId) {
                $mapping['person_id'] = $this->personId;
            }

            if ($this->organizationId) {
                $mapping['organization_id'] = $this->organizationId;
            }

            $value = new \stdClass();
            $value->amount = $mapping['value'] ?? 0;
            $value->currency = $mapping['currency'] ?? 'USD';

            unset($mapping['currency']);

            $mapping['value'] = $value->amount ? $value : null;

            $note = $mapping['note'] ?? false;
            unset($mapping['note']);

            $response = $client->post(
                $this->getEndpoint('/leads'),
                [
                    'json' => $mapping,
                ],
            );

            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                $this->leadId = $json->data->id;
            }

            if (!empty($note)) {
                $json = [
                    'content' => $note,
                    'lead_id' => $this->leadId,
                    'pinned_to_lead_flag' => '1',
                ];

                $this->addNote($client, $json);
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

        try {
            $userId = $this->getUserId();
            if ($userId) {
                $mapping['user_id'] = $userId;
            }

            $stageId = $this->getStageId();
            if ($stageId) {
                $mapping['stage_id'] = $stageId;
            }

            if ($this->personId) {
                $mapping['person_id'] = $this->personId;
            }

            if ($this->organizationId) {
                $mapping['org_id'] = $this->organizationId;
            }

            $note = $mapping['note'] ?? false;
            unset($mapping['note']);

            $response = $client->post(
                $this->getEndpoint('/deals'),
                [
                    'json' => $mapping,
                ],
            );

            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                $this->dealId = (int) $json->data->id;
            }

            if (!empty($note)) {
                $json = [
                    'content' => $note,
                    'deal_id' => $this->dealId,
                    'pinned_to_deal_flag' => '1',
                ];

                $this->addNote($client, $json);
            }
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function addNote(Client $client, array $json): void
    {
        try {
            $client->post(
                $this->getEndpoint('/notes'),
                [
                    'json' => $json,
                ],
            );
        } catch (\Exception $exception) {
            $this->processException($exception);
        }
    }

    private function searchForDuplicate(Client $client, array $terms, string $type): ?int
    {
        if (!$this->isDetectDuplicates()) {
            return null;
        }

        foreach ($terms as $field => $searchTerms) {
            if (!\is_array($searchTerms)) {
                $searchTerms = [$searchTerms];
            }

            foreach ($searchTerms as $term) {
                if (\strlen($term) < 2) {
                    continue;
                }

                try {
                    $response = $client->get(
                        $this->getEndpoint('/itemSearch'),
                        [
                            'query' => [
                                'term' => $term,
                                'item_types' => $type,
                                'fields' => $field,
                                'exact_match' => true,
                                'limit' => 1,
                            ],
                        ]
                    );

                    $json = json_decode((string) $response->getBody(), false);

                    if (\count($json->data->items) > 0) {
                        return (int) $json->data->items[0]->item->id;
                    }
                } catch (\Exception $exception) {
                    $this->processException($exception);
                }
            }
        }

        return null;
    }
}
