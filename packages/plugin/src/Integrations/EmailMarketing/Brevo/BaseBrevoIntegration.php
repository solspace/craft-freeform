<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\EmailMarketing\Brevo;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegration;

abstract class BaseBrevoIntegration extends EmailMarketingIntegration implements BrevoIntegrationInterface
{
    public const CATEGORY_CONTACTS = 'contacts';

    protected const LOG_CATEGORY = 'Brevo';

    protected const CATEGORY_CONTACT_ATTRIBUTES = 'ContactAttributes';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your API Key here.',
        order: 2,
    )]
    protected string $apiKey = '';

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/account'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        $response = $client->get($this->getEndpoint('/contacts/attributes'));
        $json = json_decode((string) $response->getBody());

        if (!isset($json) || !$json) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        foreach ($json->attributes as $field) {
            if (!$this->isMappableAttribute($field)) {
                continue;
            }

            $fieldList[] = new FieldObject(
                $field->name,
                $field->name,
                $this->getFieldType($field),
                $category,
                false,
            );
        }

        return $fieldList;
    }

    public function fetchLists(Client $client): array
    {
        $lists = [];
        $offset = 0;
        $limit = 50;

        while (null !== $offset) {
            $response = $client->get($this->getEndpoint('/contacts/lists?limit='.$limit.'&offset='.$offset.'&sort=ASC'));
            $json = json_decode((string) $response->getBody());

            $offset += $limit;

            $total = (int) $json->count;
            if ($total <= $offset) {
                $offset = null;
            }

            if (isset($json->lists)) {
                foreach ($json->lists as $list) {
                    if (isset($list->id, $list->name)) {
                        $lists[] = new ListObject(
                            $list->id,
                            $list->name,
                        );
                    }
                }
            }
        }

        return $lists;
    }

    private function isMappableAttribute(object $field): bool
    {
        // Calculated/global fields like BLACKLIST, READERS, CLICKERS should not be pushed.
        if (isset($field->calculatedValue)) {
            return false;
        }

        if (($field->category ?? null) === 'global') {
            return false;
        }

        return true;
    }

    private function getFieldType(object $field): string
    {
        if (isset($field->enumeration)) {
            return FieldObject::TYPE_STRING;
        }

        return match ($field->type ?? null) {
            'multiple-choice' => FieldObject::TYPE_ARRAY,
            'boolean' => FieldObject::TYPE_BOOLEAN,
            'number' => FieldObject::TYPE_NUMERIC,
            'float' => FieldObject::TYPE_FLOAT,
            'date' => FieldObject::TYPE_DATE,
            'datetime' => FieldObject::TYPE_DATETIME,
            default => FieldObject::TYPE_STRING,
        };
    }
}
