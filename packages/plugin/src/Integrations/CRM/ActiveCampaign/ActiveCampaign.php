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

namespace Solspace\Freeform\Integrations\CRM\ActiveCampaign;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Type(
    name: 'ActiveCampaign',
    iconPath: __DIR__.'/icon.svg',
)]
class ActiveCampaign extends CRMIntegration
{
    public const LOG_CATEGORY = 'ActiveCampaign';

    private const CATEGORY_CONTACT = 'contact';
    private const CATEGORY_DEAL = 'deal';
    private const CATEGORY_ORGANISATION = 'organisation';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Token',
        instructions: 'Enter your API Token here.',
    )]
    protected string $apiToken = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API URL',
        instructions: 'Enter your API specific URL here.',
    )]
    protected string $apiUrl = '';

    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter the name or ID of the desired Pipeline.',
    )]
    protected string $pipeline = '';

    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter the name or ID of the desired Stage.',
    )]
    protected string $stage = '';

    #[Input\Text(
        label: 'Owner (Optional if auto-assign enabled in AC)',
        instructions: "Enter the username or ID of the user you wish to assign as the deal owner. If you don't specify an owner, Active Campaign will auto-assign an owner if it is set up.",
    )]
    protected string $owner = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $pipelineId = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $stageId = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $ownerId = '';

    public function push(Form $form): bool
    {
        // TODO: reimplement
        return false;
        $client = $this->generateAuthorizedClient();

        $deal = $contact = $org = [];
        $dealProps = $contactProps = [];

        foreach ($keyValueList as $key => $value) {
            preg_match('/^(\w+)___(.+)$/', $key, $matches);

            [$all, $target, $propName] = $matches;

            if (is_numeric($propName)) {
                switch ($target) {
                    case 'contact':
                        if (\is_array($value)) {
                            $value = '||'.implode('||', $value).'||';
                        }

                        $contactProps[] = ['contact' => null, 'field' => (int) $propName, 'value' => $value];

                        break;

                    case 'deal':
                        $dealProps[] = ['dealId' => null, 'customFieldId' => (int) $propName, 'fieldValue' => $value];

                        break;
                }
            } else {
                switch ($target) {
                    case 'contact':
                        $contact[$propName] = $value;

                        break;

                    case 'organisation':
                        $org[$propName] = $value;

                        break;

                    case 'deal':
                        $deal[$propName] = $value;

                        break;
                }
            }
        }

        $organizationId = null;
        if ($org) {
            try {
                $response = $client->post(
                    $this->getEndpoint('/organizations'),
                    ['json' => ['organization' => $org]]
                );

                $json = json_decode((string) $response->getBody(), false);
                if (isset($json->organization)) {
                    $organizationId = $json->organization->id;
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                if (422 === $e->getCode()) {
                    try {
                        $response = $client->get($this->getEndpoint('/organizations'));
                        $list = json_decode($response->getBody(), false);
                        foreach ($list->organizations as $organization) {
                            if (strtolower($organization->name) === strtolower($org['name'])) {
                                $organizationId = $organization->id;

                                break;
                            }
                        }
                    } catch (RequestException $exception) {
                        $responseBody = (string) $e->getResponse()->getBody();

                        $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
                    }
                } else {
                    $responseBody = (string) $e->getResponse()->getBody();

                    $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
                }
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        $contactId = null;
        if (!empty($contact)) {
            if ($organizationId) {
                $contact['orgid'] = $organizationId;
            }

            $mailingListId = null;
            if (isset($contact['mailing_list_id'])) {
                $mailingListId = $contact['mailing_list_id'];
                unset($contact['mailing_list_id']);
            }

            try {
                $response = $client->post(
                    $this->getEndpoint('/contact/sync'),
                    ['json' => ['contact' => $contact]]
                );

                $json = json_decode($response->getBody(), false);
                if (isset($json->contact)) {
                    $contactId = $json->contact->id;
                }

                $this->getHandler()->onAfterResponse($this, $response);

                foreach ($contactProps as $prop) {
                    $prop['contact'] = $contactId;

                    $client->post(
                        $this->getEndpoint('/fieldValues'),
                        ['json' => ['fieldValue' => $prop]]
                    );
                }
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }

            if ($contactId && $mailingListId) {
                try {
                    $client->post(
                        $this->getEndpoint('/contactLists'),
                        [
                            'json' => [
                                'contactList' => [
                                    'list' => $mailingListId,
                                    'contact' => $contactId,
                                    'status' => 1,
                                ],
                            ],
                        ]
                    );
                } catch (RequestException $e) {
                    $this->getLogger()->error($e->getRequest()->getBody());
                }
            }
        }

        if (!empty($deal)) {
            $pipelineId = $this->fetchPipelineId($deal['group'] ?? $this->getPipelineId());
            if ($pipelineId) {
                $deal['group'] = $pipelineId;
            }

            $stageId = $this->fetchStageId($deal['stage'] ?? $this->getStageId(), $pipelineId);
            if ($stageId) {
                $deal['stage'] = $stageId;
            }

            $ownerId = $this->fetchOwnerId($deal['owner'] ?? $this->getOwnerId());
            if ($ownerId) {
                $deal['owner'] = $ownerId;
            }

            if ($contactId) {
                $deal['contact'] = $contactId;
            }

            try {
                $response = $client->post(
                    $this->getEndpoint('/deals'),
                    ['json' => ['deal' => $deal]]
                );

                $json = json_decode((string) $response->getBody(), false);
                if (isset($json->deal)) {
                    $dealId = $json->deal->id;

                    foreach ($dealProps as $prop) {
                        $prop['dealId'] = $dealId;

                        $client->post(
                            $this->getEndpoint('/dealCustomFieldData'),
                            ['json' => ['dealCustomFieldDatum' => $prop]]
                        );
                    }
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();

                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        return true;
    }

    public function checkConnection(): bool
    {
        try {
            $response = $this->generateAuthorizedClient()->get($this->getEndpoint('/'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $e) {
            throw new IntegrationException($e->getMessage(), $e->getCode(), $e->getPrevious());
        }
    }

    public function fetchFields(string $category): array
    {
        $client = $this->generateAuthorizedClient();

        return match ($category) {
            self::CATEGORY_CONTACT => $this->fetchContactFields($client),
            self::CATEGORY_DEAL => $this->fetchDealFields($client),
            self::CATEGORY_ORGANISATION => [
                new FieldObject('name', 'Name', FieldObject::TYPE_STRING, self::CATEGORY_ORGANISATION),
            ],
            default => [],
        };
    }

    /**
     * Perform anything necessary before this integration is saved.
     *
     * @throws IntegrationException
     */
    public function onBeforeSave(): void
    {
        $apiToken = $this->getApiToken();
        $apiUrl = $this->getApiRootUrl();
        $pipeline = $this->getPipeline();
        $stage = $this->getStage();
        $owner = $this->getOwner();

        // If one of these isn't present, we just return void
        if (!$apiToken || !$apiUrl) {
            return;
        }

        $this->pipelineId = $this->fetchPipelineId($pipeline);
        if (!$this->pipelineId) {
            $this->pipeline = '';
        }

        $this->stageId = $this->fetchStageId($stage, $this->pipelineId);
        if (!$this->stageId) {
            $this->stage = '';
        }

        $this->ownerId = $this->fetchOwnerId($owner);
        if (!$this->ownerId) {
            $this->owner = '';
        }
    }

    public function initiateAuthentication(): void
    {
    }

    /**
     * Get the base ActiveCampaign API URL.
     */
    public function getApiRootUrl(): string
    {
        return rtrim($this->getApiUrl(), '/').'/api/3/';
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'headers' => [
                'Api-Token' => $this->getApiToken(),
            ],
        ]);
    }

    private function getApiToken(): string
    {
        return $this->getProcessedValue($this->apiToken);
    }

    private function getApiUrl(): string
    {
        return $this->getProcessedValue($this->apiUrl);
    }

    private function getPipeline(): string
    {
        return $this->getProcessedValue($this->pipeline);
    }

    private function getPipelineId(): ?string
    {
        return $this->pipelineId;
    }

    private function getStage(): string
    {
        return $this->getProcessedValue($this->stage);
    }

    private function getStageId(): ?string
    {
        return $this->stageId;
    }

    private function getOwner(): string
    {
        return $this->getProcessedValue($this->owner);
    }

    private function getOwnerId(): ?string
    {
        return $this->ownerId;
    }

    private function fetchPipelineId($pipeline = null): ?string
    {
        if (!$pipeline) {
            return null;
        }

        if (is_numeric($pipeline)) {
            return $pipeline;
        }

        try {
            $client = $this->generateAuthorizedClient();
            $response = $client->get(
                $this->getEndpoint('/dealGroups'),
                ['query' => ['filters[title]' => $pipeline]]
            );

            $json = json_decode($response->getBody(), false);
            if (isset($json->dealGroups) && \count($json->dealGroups)) {
                $item = $json->dealGroups[0];

                return $item->id;
            }
        } catch (RequestException $e) {
            $this->getLogger()->warning($e->getMessage());
        }

        return null;
    }

    private function fetchStageId($stage = null, $pipeline = null): ?string
    {
        if (!$stage) {
            return null;
        }

        $pipelineId = $this->fetchPipelineId($pipeline);

        if (is_numeric($stage)) {
            return $stage;
        }

        try {
            $client = $this->generateAuthorizedClient();

            $query = ['filters[title]' => $stage];
            if ($pipelineId) {
                $query['filters[d_groupid]'] = $pipelineId;
            }
            $response = $client->get(
                $this->getEndpoint('/dealStages'),
                ['query' => $query]
            );

            $json = json_decode($response->getBody(), false);
            if (isset($json->dealStages) && \count($json->dealStages)) {
                $item = $json->dealStages[0];

                return $item->id;
            }
        } catch (RequestException $e) {
            $this->getLogger()->warning($e->getMessage());
        }

        return null;
    }

    private function fetchOwnerId($owner = null): ?string
    {
        if (!$owner) {
            return null;
        }

        if (is_numeric($owner)) {
            return $owner;
        }

        try {
            $client = $this->generateAuthorizedClient();
            $response = $client->get($this->getEndpoint('/users/username/'.$owner));

            $json = json_decode($response->getBody(), false);
            if (isset($json->user)) {
                return $json->user->id;
            }
        } catch (RequestException $e) {
            $this->getLogger()->warning($e->getMessage());
        }

        return null;
    }

    /**
     * @return FieldObject[]
     */
    private function fetchContactFields(Client $client): array
    {
        $category = self::CATEGORY_CONTACT;

        $fields = [
            new FieldObject('mailing_list_id', 'Mailing List ID', FieldObject::TYPE_NUMERIC, $category),
            new FieldObject('email', 'Email', FieldObject::TYPE_STRING, $category),
            new FieldObject('firstName', 'First Name', FieldObject::TYPE_STRING, $category),
            new FieldObject('lastName', 'Last Name', FieldObject::TYPE_STRING, $category),
            new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING, $category),
        ];

        try {
            $response = $client->get($this->getEndpoint('/fields'));
            $data = json_decode($response->getBody(), false);

            foreach ($data->fields as $field) {
                $type = FieldObject::TYPE_STRING;

                switch ($field->type) {
                    case 'dropdown':
                    case 'multiselect':
                    case 'checkbox':
                        $type = FieldObject::TYPE_ARRAY;

                        break;

                    case 'date':
                        $type = FieldObject::TYPE_DATETIME;

                        break;

                    case 'currency':
                        continue 2;
                }

                $fields[] = new FieldObject(
                    $field->id,
                    $field->title,
                    $type,
                    $category,
                    (bool) $field->isrequired
                );
            }
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);
        }

        return $fields;
    }

    /**
     * @return FieldObject[]
     */
    private function fetchDealFields(Client $client): array
    {
        $category = self::CATEGORY_DEAL;

        $fields = [
            new FieldObject('title', 'Title', FieldObject::TYPE_STRING, $category),
            new FieldObject('description', 'Description', FieldObject::TYPE_STRING, $category),
            new FieldObject('value', 'Value', FieldObject::TYPE_NUMERIC, $category),
            new FieldObject('currency', 'Currency', FieldObject::TYPE_STRING, $category),
            new FieldObject('group', 'Group', FieldObject::TYPE_STRING, $category),
            new FieldObject('owner', 'Owner', FieldObject::TYPE_STRING, $category),
            new FieldObject('percent', 'Percent', FieldObject::TYPE_STRING, $category),
            new FieldObject('stage', 'Stage', FieldObject::TYPE_STRING, $category),
            new FieldObject('status', 'Status', FieldObject::TYPE_NUMERIC, $category),
        ];

        try {
            $response = $client->get($this->getEndpoint('/dealCustomFieldMeta'));
            $data = json_decode($response->getBody(), false);

            foreach ($data->dealCustomFieldMeta as $field) {
                $type = FieldObject::TYPE_STRING;

                switch ($field->fieldType) {
                    case 'dropdown':
                    case 'multiselect':
                    case 'checkbox':
                        $type = FieldObject::TYPE_ARRAY;

                        break;

                    case 'date':
                        $type = FieldObject::TYPE_DATETIME;

                        break;

                    case 'currency':
                        continue 2;
                }

                $fields[] = new FieldObject(
                    $field->id,
                    $field->fieldLabel,
                    $type,
                    $category,
                    (bool) $field->isRequired
                );
            }
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);
        }

        return $fields;
    }
}
