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

namespace Solspace\Freeform\Integrations\CRM\ActiveCampaign\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\ActiveCampaign\BaseActiveCampaignIntegration;

#[Type(
    name: 'ActiveCampaign (v3)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class ActiveCampaignV3 extends BaseActiveCampaignIntegration
{
    protected const API_VERSION = '3';

    // ==========================================
    //                Contact
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Contact?',
        instructions: 'Should map to contact',
        order: 8,
    )]
    protected bool $mapContact = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapContact)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable ActiveCampaign Contact fields',
        order: 9,
        source: 'api/integrations/crm/fields/Contact',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    // ==========================================
    //                  Deal
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Deal?',
        instructions: 'Should map to deal',
        order: 10,
    )]
    protected bool $mapDeal = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapDeal)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable ActiveCampaign Deal fields',
        order: 11,
        source: 'api/integrations/crm/fields/Deal',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    // ==========================================
    //                Account
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Account?',
        instructions: 'Should map to account',
        order: 12,
    )]
    protected bool $mapAccount = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapAccount)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable ActiveCampaign Account fields',
        order: 13,
        source: 'api/integrations/crm/fields/Account',
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $accountMapping = null;

    private array $contactProps = [];

    private array $dealProps = [];

    private array $contact = [];

    private array $deal = [];

    private array $account = [];

    private int $contactId = 0;

    private int $accountId = 0;

    public function getApiRootUrl(): string
    {
        $url = $this->getApiUrl();

        $url = rtrim($url, '/');

        return $url.'/api/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): bool
    {
        $this->setProps($form);
        $this->processAccount($client);
        $this->processContact($client);
        $this->processDeal($client);

        return true;
    }

    private function setProps(Form $form): void
    {
        if ($this->mapContact) {
            $mapping = $this->processMapping($form, $this->contactMapping, 'Contact');
            if (!$mapping) {
                return;
            }

            foreach ($mapping as $key => $value) {
                if (is_numeric($key)) {
                    if (\is_array($value)) {
                        $value = '||'.implode('||', $value).'||';
                    }

                    $this->contactProps[] = [
                        'contact' => null,
                        'field' => (int) $key,
                        'value' => $value,
                    ];
                } else {
                    $this->contact[$key] = $value;
                }
            }
        }

        if ($this->mapDeal) {
            $mapping = $this->processMapping($form, $this->dealMapping, 'Deal');
            if (!$mapping) {
                return;
            }

            foreach ($mapping as $key => $value) {
                if (is_numeric($key)) {
                    if (\is_array($value)) {
                        $value = '||'.implode('||', $value).'||';
                    }

                    $this->dealProps[] = [
                        'dealId' => null,
                        'customFieldId' => (int) $key,
                        'fieldValue' => $value,
                    ];
                } else {
                    $this->deal[$key] = $value;
                }
            }
        }

        if ($this->mapAccount) {
            $mapping = $this->processMapping($form, $this->accountMapping, 'Account');
            if (!$mapping) {
                return;
            }

            foreach ($mapping as $key => $value) {
                $this->account[$key] = $value;
            }
        }
    }

    private function processAccount(Client $client): void
    {
        if (!$this->mapAccount) {
            return;
        }

        if ($this->account) {
            try {
                $response = $client->post(
                    $this->getEndpoint('/accounts'),
                    [
                        'json' => [
                            'account' => $this->account,
                        ],
                    ],
                );

                $json = json_decode((string) $response->getBody(), false);

                if (isset($json->account)) {
                    $this->accountId = $json->account->id;
                }
            } catch (\Exception $exception) {
                if (422 === $exception->getCode()) {
                    try {
                        $response = $client->get($this->getEndpoint('/accounts'));

                        $json = json_decode($response->getBody(), false);

                        foreach ($json->accounts as $account) {
                            if (!empty($this->account['name']) && strtolower($account->name) === strtolower($this->account['name'])) {
                                $this->accountId = $account->id;

                                break;
                            }
                        }
                    } catch (\Exception $exception) {
                        $this->processException($exception, self::LOG_CATEGORY);
                    }
                } else {
                    $this->processException($exception, self::LOG_CATEGORY);
                }
            }
        }
    }

    private function processContact(Client $client): void
    {
        if (!$this->mapContact) {
            return;
        }

        if (!empty($this->contact)) {
            try {
                $listId = null;
                if (isset($this->contact['listId'])) {
                    $listId = $this->contact['listId'];

                    unset($this->contact['listId']);
                }

                $response = $client->post(
                    $this->getEndpoint('/contact/sync'),
                    [
                        'json' => [
                            'contact' => $this->contact,
                        ],
                    ],
                );

                $json = json_decode($response->getBody(), false);

                if (isset($json->contact)) {
                    $this->contactId = $json->contact->id;
                }

                if ($this->accountId) {
                    $this->contact['contact'] = $this->contactId;
                    $this->contact['account'] = $this->accountId;

                    $client->post(
                        $this->getEndpoint('/accountContacts'),
                        [
                            'json' => [
                                'accountContact' => $this->contact,
                            ],
                        ],
                    );
                }

                foreach ($this->contactProps as $prop) {
                    $prop['contact'] = $this->contactId;

                    $client->post(
                        $this->getEndpoint('/fieldValues'),
                        [
                            'json' => [
                                'fieldValue' => $prop,
                            ],
                        ],
                    );
                }
            } catch (\Exception $exception) {
                $this->processException($exception, self::LOG_CATEGORY);
            }

            if ($this->contactId && $listId) {
                try {
                    $client->post(
                        $this->getEndpoint('/contactLists'),
                        [
                            'json' => [
                                'contactList' => [
                                    'list' => $listId,
                                    'contact' => $this->contactId,
                                    'status' => 1,
                                ],
                            ],
                        ]
                    );
                } catch (\Exception $exception) {
                    $this->processException($exception, self::LOG_CATEGORY);
                }
            }
        }
    }

    private function processDeal(Client $client): void
    {
        if (!$this->mapDeal) {
            return;
        }

        if (!empty($this->deal)) {
            $pipelineId = $this->fetchPipelineId($client, $this->deal['group'] ?? $this->getPipelineId());
            if ($pipelineId) {
                $this->deal['group'] = (string) $pipelineId;
            }

            $stageId = $this->fetchStageId($client, $this->deal['stage'] ?? $this->getStageId(), $pipelineId);
            if ($stageId) {
                $this->deal['stage'] = (string) $stageId;
            }

            $ownerId = $this->fetchOwnerId($client, $this->deal['owner'] ?? $this->getOwnerId());
            if ($ownerId) {
                $this->deal['owner'] = (string) $ownerId;
            }

            if ($this->contactId) {
                $this->deal['contact'] = (string) $this->contactId;
            }

            $this->deal['title'] = 'Deal';
            $this->deal['currency'] = 'usd';
            $this->deal['value'] = 0;

            try {
                $response = $client->post(
                    $this->getEndpoint('/deals'),
                    [
                        'json' => [
                            'deal' => $this->deal,
                        ],
                    ],
                );

                $json = json_decode((string) $response->getBody(), false);

                if (isset($json->deal)) {
                    $dealId = $json->deal->id;

                    foreach ($this->dealProps as $prop) {
                        $prop['dealId'] = $dealId;

                        $client->post(
                            $this->getEndpoint('/dealCustomFieldData'),
                            [
                                'json' => [
                                    'dealCustomFieldDatum' => $prop,
                                ],
                            ],
                        );
                    }
                }
            } catch (\Exception $exception) {
                $this->processException($exception, self::LOG_CATEGORY);
            }
        }
    }
}
