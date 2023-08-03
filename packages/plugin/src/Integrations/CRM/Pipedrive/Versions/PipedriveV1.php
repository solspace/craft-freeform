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
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators;
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
    private const CATEGORY_DEAL = 'Deal';
    private const CATEGORY_LEAD = 'Lead';
    private const CATEGORY_PERSON = 'Person';
    private const CATEGORY_ORGANIZATION = 'Organization';
    private const API_VERSION = 'v1';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Leads?',
        instructions: 'Should map to leads?',
        order: 3,
    )]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapLeads)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Pipedrive Lead fields',
        order: 4,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_LEAD,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Deals?',
        instructions: 'Should map to deals?',
        order: 5,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Validators\Required]
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
        source: 'api/integrations/crm/fields/'.self::CATEGORY_DEAL,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Organization?',
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
        source: 'api/integrations/crm/fields/'.self::CATEGORY_ORGANIZATION,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $organizationMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Person?',
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
        source: 'api/integrations/crm/fields/'.self::CATEGORY_PERSON,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $personMapping = null;

    private ?int $organizationId = null;

    private ?int $personId = null;

    public function getApiRootUrl(): string
    {
        return $this->getApiDomain().'/api/'.self::API_VERSION.'/';
    }

    public function getStageId(): string
    {
        return $this->getProcessedValue($this->stageId);
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

    private function processOrganization(Form $form, Client $client): void
    {
        if (!$this->mapOrganization) {
            return;
        }

        $mapping = $this->processMapping($form, $this->organizationMapping, self::CATEGORY_ORGANIZATION);
        if (!$mapping) {
            return;
        }

        try {
            if ($this->getUserId()) {
                $mapping['owner_id'] = $this->getUserId();
            }

            $organizationId = $this->searchForDuplicate($client, ['name' => $mapping['name'] ?? null], 'organization');
            if ($organizationId) {
                $this->organizationId = $organizationId;
            }

            $response = $client->post($this->getEndpoint('/organizations'), ['json' => $mapping]);
            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                $this->organizationId = (int) $json->data->id;
            }
        } catch (RequestException $exception) {
            $this->getLogger()->error((string) $exception->getResponse()->getBody(), ['exception' => $exception->getMessage()]);
        } catch (\Exception $exception) {
            $this->getLogger()->error($exception->getMessage());
        }
    }

    private function processPerson(Form $form, Client $client): void
    {
        if (!$this->mapPerson) {
            return;
        }

        $mapping = $this->processMapping($form, $this->personMapping, self::CATEGORY_PERSON);
        if (!$mapping) {
            return;
        }

        $personId = $this->searchForDuplicate($client, ['email' => $mapping['email'] ?? null], 'person');

        try {
            if ($this->getUserId()) {
                $mapping['owner_id'] = $this->getUserId();
            }

            if ($this->organizationId) {
                $mapping['org_id'] = $this->organizationId;
            }

            if ($personId) {
                unset($mapping['email']);

                $response = $client->put($this->getEndpoint("/persons/{$personId}"), ['json' => $mapping]);
            } else {
                $response = $client->post($this->getEndpoint('/persons'), ['json' => $mapping]);
            }

            $json = json_decode((string) $response->getBody());

            if (isset($json->data->id)) {
                $this->personId = (int) $json->data->id;
            }
        } catch (RequestException $exception) {
            $this->getLogger()->error((string) $exception->getResponse()->getBody(), ['exception' => $exception->getMessage()]);
        } catch (\Exception $exception) {
            $this->getLogger()->error($exception->getMessage());
        }
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

        try {
            if ($this->organizationId) {
                $mapping['organization_id'] = $this->organizationId;
            }

            if ($this->personId) {
                $mapping['person_id'] = $this->personId;
            }

            if ($this->getUserId()) {
                $mapping['owner_id'] = $this->getUserId();
            }

            $value = new \stdClass();
            $value->amount = $mapping['value'] ?? 0;
            $value->currency = $mapping['currency'] ?? 'USD';

            unset($mapping['currency']);

            $mapping['value'] = $value->amount ? $value : null;

            $client->post($this->getEndpoint('/leads'), ['json' => $mapping]);

            $this->addNote('org', $this->organizationId, $mapping['note'] ?? null);
            $this->addNote('person', $this->personId, $mapping['note'] ?? null);
        } catch (RequestException $exception) {
            $this->getLogger()->error((string) $exception->getResponse()->getBody(), ['exception' => $exception->getMessage()]);
        } catch (\Exception $exception) {
            $this->getLogger()->error($exception->getMessage());
        }
    }

    private function processDeals(Form $form, Client $client): void
    {
        if (!$this->mapDeals) {
            return;
        }

        $mapping = $this->processMapping($form, $this->dealMapping, self::CATEGORY_DEAL);
        if (!$mapping) {
            return;
        }

        try {
            if ($this->getUserId()) {
                $mapping['user_id'] = $this->getUserId();
            }

            if ($this->personId) {
                $mapping['person_id'] = $this->personId;
            }

            if ($this->organizationId) {
                $mapping['org_id'] = $this->organizationId;
            }

            $stageId = $this->getStageId();
            if ($stageId) {
                $mapping['stage_id'] = (int) $stageId;
            }

            $response = $client->post($this->getEndpoint('/deals'), ['json' => $mapping]);
            $json = json_decode((string) $response->getBody(), false);

            if (isset($json->data->id)) {
                // FIXME
                $mapping['note'] = 'FooBar';

                $this->addNote('deal', $json->data->id, $mapping['note'] ?? null);
                $this->addNote('org', $this->organizationId, $mapping['note'] ?? null);
                $this->addNote('person', $this->personId, $mapping['note'] ?? null);
            }
        } catch (RequestException $exception) {
            $this->getLogger()->error((string) $exception->getResponse()->getBody(), ['exception' => $exception->getMessage()]);
        } catch (\Exception $exception) {
            $this->getLogger()->error($exception->getMessage());
        }
    }

    private function addNote($prefix, $id, $content): void
    {
        if (!$prefix || !$id || empty($content)) {
            return;
        }

        try {
            $json = [];
            $json['content'] = $content;

            if ('org' === $prefix) {
                $json['org_id'] = $id;
                $json['pinned_to_organization_flag'] = '1';
            }

            if ('lead' === $prefix) {
                $json['lead_id'] = $id;
                $json['pinned_to_lead_flag'] = '1';
            }

            if ('deal' === $prefix) {
                $json['deal_id'] = $id;
                $json['pinned_to_deal_flag'] = '1';
            }

            if ('person' === $prefix) {
                $json['person_id'] = $id;
                $json['pinned_to_person_flag'] = '1';
            }

            $client = $this->generateAuthorizedClient();
            $client->post($this->getEndpoint('/notes'), ['json' => $json]);
        } catch (RequestException $exception) {
            $this->getLogger()->error($exception->getMessage(), ['response' => $exception->getResponse()]);
        }
    }

    private function addOrgNote(int $id, string $content): void
    {
        if (!$id || empty($content)) {
            return;
        }

        try {
            $json = [];
            $json['org_id'] = $id;
            $json['content'] = $content;
            $json['pinned_to_organization_flag'] = '1';

            $client = $this->generateAuthorizedClient();
            $client->post($this->getEndpoint('/notes'), ['json' => $json]);
        } catch (RequestException $exception) {
            $this->getLogger()->error($exception->getMessage(), ['response' => $exception->getResponse()]);
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
                    $response = $client->get($this->getEndpoint('/itemSearch'), [
                        'query' => [
                            'term' => $term,
                            'item_types' => $type,
                            'fields' => $field,
                            'exact_match' => true,
                            'limit' => 1,
                        ],
                    ]);
                    $results = json_decode($response->getBody())->data->items;

                    if (\count($results) > 0) {
                        return (int) $results[0]->item->id;
                    }
                } catch (RequestException $exception) {
                    $this->getLogger()->error((string) $exception->getResponse()->getBody(), ['exception' => $exception->getMessage()]);
                }
            }
        }

        return null;
    }
}
