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

namespace Solspace\Freeform\Integrations\MailingLists\ConstantContact;

use GuzzleHttp\Client;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegration;

abstract class BaseConstantContactIntegration extends MailingListIntegration implements OAuth2ConnectorInterface, ConstantContactIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'Constant Contact';

    protected const CATEGORY_CONTACT_CUSTOM = 'Contact_Custom';

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/contact_lists'));

            $json = json_decode((string) $response->getBody());

            return !empty($json->lists);
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/contact_custom_fields'));
        } catch (\Exception $exception) {
            $this->processException($exception, $category);
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->custom_fields) || !$json->custom_fields) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        $fieldList[] = new FieldObject(
            'first_name',
            'First Name',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'last_name',
            'Last Name',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'job_title',
            'Job Title',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'company_name',
            'Company Name',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'phone_number',
            'Phone Number',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'anniversary',
            'Anniversary',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'birthday_month',
            'Birthday Month',
            FieldObject::TYPE_NUMERIC,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'birthday_day',
            'Birthday Day',
            FieldObject::TYPE_NUMERIC,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_kind',
            'Address: Kind',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_street',
            'Address: Street',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_city',
            'Address: City',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_state',
            'Address: State',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_postal_code',
            'Address: Postal Code',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        $fieldList[] = new FieldObject(
            'street_address_country',
            'Address: Country',
            FieldObject::TYPE_STRING,
            $category,
            false,
        );

        foreach ($json->custom_fields as $field) {
            $fieldList[] = new FieldObject(
                'custom_'.$field->custom_field_id,
                $field->label,
                FieldObject::TYPE_STRING,
                $category,
                false,
            );
        }

        return $fieldList;
    }

    public function fetchLists(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/contact_lists'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];

        if (isset($json->lists)) {
            foreach ($json->lists as $list) {
                if (isset($list->list_id, $list->name)) {
                    $lists[] = new ListObject(
                        $list->list_id,
                        $list->name,
                    );
                }
            }
        }

        return $lists;
    }
}
