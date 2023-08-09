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
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BaseActiveCampaignIntegration extends CRMIntegration implements ActiveCampaignIntegrationInterface
{
    protected const LOG_CATEGORY = 'ActiveCampaign';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $pipelineId = 0;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $stageId = 0;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected int $ownerId = 0;

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'API Token',
        instructions: 'Enter your API Token here.',
        order: 1,
    )]
    protected string $apiToken = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'API URL',
        instructions: 'Enter your API specific URL (e.g. "https://youraccountname.api-us1.com" or "https://youraccountname.activehosted.com").',
        order: 2,
    )]
    protected string $apiUrl = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Pipeline',
        instructions: 'Enter the name or ID of the desired Pipeline.',
        order: 3,
    )]
    protected string $pipeline = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Stage',
        instructions: 'Enter the name or ID of the desired Stage.',
        order: 4,
    )]
    protected string $stage = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Owner (Optional if auto-assign enabled in AC)',
        instructions: "Enter the username or ID of the user you wish to assign as the deal owner. If you don't specify an owner, Active Campaign will auto-assign an owner if it is set up.",
        order: 5,
    )]
    protected string $owner = '';

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/webhooks'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function getApiToken(): string
    {
        return $this->getProcessedValue($this->apiToken);
    }

    public function getPipelineId(): int
    {
        return $this->pipelineId;
    }

    public function setPipelineId(int $pipelineId): self
    {
        $this->pipelineId = $pipelineId;

        return $this;
    }

    public function getStageId(): int
    {
        return $this->stageId;
    }

    public function setStageId(int $stageId): self
    {
        $this->stageId = $stageId;

        return $this;
    }

    public function getOwnerId(): int
    {
        return $this->ownerId;
    }

    public function setOwnerId(int $ownerId): self
    {
        $this->ownerId = $ownerId;

        return $this;
    }

    public function onBeforeSave(Client $client): void
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

        $pipelineId = $this->fetchPipelineId($client, $pipeline);
        if ($pipelineId) {
            $this->setPipelineId($pipelineId);
        }

        $stageId = $this->fetchStageId($client, $stage, $pipelineId);
        if ($stageId) {
            $this->setStageId($stageId);
        }

        $ownerId = $this->fetchOwnerId($client, $owner);
        if ($ownerId) {
            $this->setOwnerId($ownerId);
        }
    }

    public function fetchFields(string $category, Client $client): array
    {
        if ('Contact' === $category) {
            return $this->fetchContactFields($client);
        }

        if ('Deal' === $category) {
            return $this->fetchDealFields($client);
        }

        if ('Account' === $category) {
            return $this->fetchAccountFields($client);
        }

        return [];
    }

    protected function getApiUrl(): string
    {
        return $this->getProcessedValue($this->apiUrl);
    }

    protected function getPipeline(): string
    {
        return $this->getProcessedValue($this->pipeline);
    }

    protected function getStage(): string
    {
        return $this->getProcessedValue($this->stage);
    }

    protected function getOwner(): string
    {
        return $this->getProcessedValue($this->owner);
    }

    protected function fetchPipelineId(Client $client, mixed $pipeline): ?int
    {
        if (!$pipeline) {
            return null;
        }

        if (is_numeric($pipeline)) {
            return $pipeline;
        }

        $pipelineId = null;

        try {
            $response = $client->get(
                $this->getEndpoint('/dealGroups'),
                [
                    'query' => [
                        'filters[title]' => $pipeline,
                    ],
                ],
            );

            $json = json_decode($response->getBody(), false);

            if (isset($json->dealGroups) && \count($json->dealGroups)) {
                $item = $json->dealGroups[0];

                $pipelineId = $item->id;
            }
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        return $pipelineId;
    }

    protected function fetchStageId(Client $client, mixed $stage, mixed $pipelineId): ?int
    {
        if (!$stage) {
            return null;
        }

        if (is_numeric($stage)) {
            return $stage;
        }

        if (!$pipelineId) {
            return null;
        }

        if (!is_numeric($pipelineId)) {
            return null;
        }

        $stageId = null;

        try {
            $response = $client->get(
                $this->getEndpoint('/dealStages'),
                [
                    'query' => [
                        'filters[title]' => $stage,
                        'filters[d_groupid]' => $pipelineId,
                    ],
                ],
            );

            $json = json_decode($response->getBody(), false);

            if (isset($json->dealStages) && \count($json->dealStages)) {
                $item = $json->dealStages[0];

                $stageId = $item->id;
            }
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        return $stageId;
    }

    protected function fetchOwnerId(Client $client, mixed $owner): ?int
    {
        if (!$owner) {
            return null;
        }

        if (is_numeric($owner)) {
            return $owner;
        }

        $ownerId = null;

        try {
            $response = $client->get($this->getEndpoint('/users/username/'.$owner));

            $json = json_decode($response->getBody(), false);

            if (!empty($json->user)) {
                $ownerId = $json->user->id;
            }
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        return $ownerId;
    }

    private function fetchContactFields(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/fields'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody(), false);

        if (!isset($json->fields) || !$json->fields) {
            throw new IntegrationException('Could not fetch fields for Contact');
        }

        $fieldList = [];

        $fieldList[] = new FieldObject(
            'listId',
            'List',
            FieldObject::TYPE_NUMERIC,
            'Contact',
            false,
        );

        $fieldList[] = new FieldObject(
            'firstName',
            'First Name',
            FieldObject::TYPE_STRING,
            'Contact',
            false,
        );

        $fieldList[] = new FieldObject(
            'lastName',
            'Last Name',
            FieldObject::TYPE_STRING,
            'Contact',
            false,
        );

        $fieldList[] = new FieldObject(
            'email',
            'Email',
            FieldObject::TYPE_STRING,
            'Contact',
            true,
        );

        $fieldList[] = new FieldObject(
            'phone',
            'Phone',
            FieldObject::TYPE_STRING,
            'Contact',
            false,
        );

        foreach ($json->fields as $field) {
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

                default:
                    $type = FieldObject::TYPE_STRING;
            }

            $fieldList[] = new FieldObject(
                $field->id,
                $field->title,
                $type,
                'Contact',
                (bool) $field->isrequired,
            );
        }

        return $fieldList;
    }

    private function fetchDealFields(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/dealCustomFieldMeta'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody(), false);

        if (!isset($json->dealCustomFieldMeta) || !$json->dealCustomFieldMeta) {
            throw new IntegrationException('Could not fetch fields for Deal');
        }

        $fieldList = [];

        $fieldList[] = new FieldObject(
            'title',
            'Title',
            FieldObject::TYPE_STRING,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'description',
            'Description',
            FieldObject::TYPE_STRING,
            'Deal',
            false,
        );

        $fieldList[] = new FieldObject(
            'value',
            'Value',
            FieldObject::TYPE_NUMERIC,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'currency',
            'Currency',
            FieldObject::TYPE_STRING,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'group',
            'Group',
            FieldObject::TYPE_STRING,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'owner',
            'Owner',
            FieldObject::TYPE_STRING,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'percent',
            'Percent',
            FieldObject::TYPE_STRING,
            'Deal',
            false,
        );

        $fieldList[] = new FieldObject(
            'stage',
            'Stage',
            FieldObject::TYPE_STRING,
            'Deal',
            true,
        );

        $fieldList[] = new FieldObject(
            'status',
            'Status',
            FieldObject::TYPE_NUMERIC,
            'Deal',
            false,
        );

        foreach ($json->dealCustomFieldMeta as $field) {
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

                default:
                    $type = FieldObject::TYPE_STRING;
            }

            $fieldList[] = new FieldObject(
                $field->id,
                $field->fieldLabel,
                $type,
                'Deal',
                (bool) $field->isRequired,
            );
        }

        return $fieldList;
    }

    private function fetchAccountFields(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/accountCustomFieldMeta'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->accountCustomFieldMeta) || !$json->accountCustomFieldMeta) {
            throw new IntegrationException('Could not fetch fields for Account');
        }

        $fieldList = [];

        $fieldList[] = new FieldObject(
            'name',
            'Name',
            FieldObject::TYPE_STRING,
            'Account',
            true,
        );

        foreach ($json->accountCustomFieldMeta as $field) {
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

                default:
                    $type = FieldObject::TYPE_STRING;
            }

            $fieldList[] = new FieldObject(
                $field->id,
                $field->fieldLabel,
                $type,
                'Account',
                (bool) $field->isRequired,
            );
        }

        return $fieldList;
    }
}
