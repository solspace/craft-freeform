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

namespace Solspace\Freeform\Integrations\EmailMarketing\CampaignMonitor;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegration;

abstract class BaseCampaignMonitorIntegration extends EmailMarketingIntegration implements OAuth2ConnectorInterface, CampaignMonitorIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    public const LOG_CATEGORY = 'Campaign Monitor';

    protected const CATEGORY_CUSTOM = 'Custom';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Campaign Monitor Client ID',
        instructions: 'Enter your Campaign Monitor Client ID here.',
        order: 4,
    )]
    protected string $campaignMonitorClientId = '';

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/clients.json'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        $listId = $list->getResourceId();

        try {
            $response = $client->get($this->getEndpoint('/lists/'.$listId.'/customfields.json'));
        } catch (\Exception $exception) {
            $this->processException($exception, $category);
        }

        $json = json_decode((string) $response->getBody());

        if (empty($json)) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        $fieldList[] = new FieldObject('Name', 'Name', FieldObject::TYPE_STRING, $category, false);

        foreach ($json as $field) {
            $type = match ($field->DataType) {
                'Text', 'MultiSelectOne' => FieldObject::TYPE_STRING,
                'MultiSelectMany' => FieldObject::TYPE_ARRAY,
                'Number' => FieldObject::TYPE_NUMERIC,
                'Date' => FieldObject::TYPE_DATE,
                default => null,
            };

            if (null === $type) {
                continue;
            }

            $fieldId = str_replace(['[', ']'], '', $field->Key);

            $fieldList[] = new FieldObject(
                $fieldId,
                $field->FieldName,
                $type,
                $category,
                false,
            );
        }

        return $fieldList;
    }

    public function fetchLists(Client $client): array
    {
        $clientId = $this->getCampaignMonitorClientId();

        try {
            $response = $client->get($this->getEndpoint('/clients/'.$clientId.'/lists.json'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];

        if (!empty($json)) {
            foreach ($json as $list) {
                if (isset($list->ListID, $list->Name)) {
                    $lists[] = new ListObject(
                        $list->ListID,
                        $list->Name,
                    );
                }
            }
        }

        return $lists;
    }

    protected function getCampaignMonitorClientId(): string
    {
        return $this->getProcessedValue($this->campaignMonitorClientId);
    }
}
