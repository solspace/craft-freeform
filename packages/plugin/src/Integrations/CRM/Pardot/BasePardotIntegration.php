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

namespace Solspace\Freeform\Integrations\CRM\Pardot;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BasePardotIntegration extends CRMIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, PardotIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'Pardot';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $instanceUrl = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Business Unit ID',
        instructions: 'Enter your Pardot business unit ID here',
        order: 1,
    )]
    protected ?string $businessUnitId = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Use custom URL?',
        instructions: 'Enable this if you connect to your Salesforce account with a custom company URL (e.g. "mycompany.my.salesforce.com").',
        order: 2,
    )]
    protected bool $useCustomUrl = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Custom URL',
        instructions: 'E.g https://mycompany.develop.my.salesforce.com',
        order: 3,
    )]
    protected ?string $customUrl = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'Enable this if your Salesforce account is in Sandbox mode (connects to "test.salesforce.com" instead of "login.salesforce.com" or "mycompany.my.salesforce.com").',
        order: 4,
    )]
    protected bool $sandboxMode = false;

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get(
                $this->getPardotEndpoint(),
                [
                    'query' => [
                        'limit' => 1,
                        'format' => 'json',
                    ],
                ],
            );

            $json = json_decode((string) $response->getBody(), true);

            return isset($json['@attributes']) && 'ok' === $json['@attributes']['stat'];
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function getAuthorizeUrl(): string
    {
        return $this->getDomain().'/services/oauth2/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return $this->getDomain().'/services/oauth2/token';
    }

    public function getInstanceUrl(): string
    {
        return $this->instanceUrl;
    }

    public function setInstanceUrl(string $instanceUrl): self
    {
        $this->instanceUrl = $instanceUrl;

        return $this;
    }

    public function fetchFields(string $category, Client $client): array
    {
        if ('Prospect' === $category) {
            return $this->getProspectFields();
        }

        return $this->getCustomFields($client);
    }

    public function getBusinessUnitId(): string
    {
        return $this->getProcessedValue($this->businessUnitId);
    }

    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field): mixed
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    protected function isCustomUrl(): bool
    {
        return $this->useCustomUrl;
    }

    protected function getCustomUrl(): ?string
    {
        return $this->customUrl;
    }

    protected function isSandboxMode(): bool
    {
        return $this->sandboxMode;
    }

    protected function getDomain(): string
    {
        $domain = 'https://login.salesforce.com';

        if ($this->isSandboxMode()) {
            $domain = 'https://test.salesforce.com';
        }

        if ($this->isCustomUrl()) {
            $domain = $this->getCustomUrl();
        }

        return $domain;
    }

    private function getProspectFields(): array
    {
        return [
            new FieldObject(
                'salutation',
                'Salutation',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'first_name',
                'First Name',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'last_name',
                'Last Name',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'email',
                'Email',
                FieldObject::TYPE_STRING,
                'Prospect',
                true,
            ),
            new FieldObject(
                'password',
                'Password',
                FieldObject::TYPE_STRING,
                'Prospect',
                true,
            ),
            new FieldObject(
                'company',
                'Company',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'prospect_account_id',
                'Prospect Account Id',
                FieldObject::TYPE_NUMERIC,
                'Prospect',
                true,
            ),
            new FieldObject(
                'website',
                'Website',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'job_title',
                'Job Title',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'department',
                'Department',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'country',
                'Country',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'address_one',
                'Address One',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'address_two',
                'Address Two',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'city',
                'City',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'state',
                'State',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'territory',
                'Territory',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'zip',
                'Zip',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'phone',
                'Phone',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'fax',
                'Fax',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'source',
                'Source',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'annual_revenue',
                'Annual Revenue',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'employees',
                'Employees',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'industry',
                'Industry',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'years_in_business',
                'Years in Business',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'comments',
                'Comments',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'notes',
                'Notes',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
            new FieldObject(
                'score',
                'Score',
                FieldObject::TYPE_NUMERIC,
                'Prospect',
                true
            ),
            new FieldObject(
                'is_do_not_email',
                'Do not email',
                FieldObject::TYPE_BOOLEAN,
                'Prospect',
                true,
            ),
            new FieldObject(
                'is_do_not_call',
                'Do not call',
                FieldObject::TYPE_BOOLEAN,
                'Prospect',
                true,
            ),
            new FieldObject(
                'is_reviewed',
                'Reviewed',
                FieldObject::TYPE_BOOLEAN,
                'Prospect',
                true,
            ),
            new FieldObject(
                'is_archived',
                'Archived',
                FieldObject::TYPE_BOOLEAN,
                'Prospect',
                true,
            ),
            new FieldObject(
                'is_starred',
                'Starred',
                FieldObject::TYPE_NUMERIC,
                'Prospect',
                true,
            ),
            new FieldObject(
                'campaign_id',
                'Campaign',
                FieldObject::TYPE_NUMERIC,
                'Prospect',
                true,
            ),
            new FieldObject(
                'profile',
                'Profile',
                FieldObject::TYPE_STRING,
                'Prospect',
                true,
            ),
            new FieldObject(
                'assign_to',
                'Assign To',
                FieldObject::TYPE_STRING,
                'Prospect',
                false,
            ),
        ];
    }

    private function getCustomFields(Client $client): array
    {
        try {
            $response = $client->get($this->getPardotEndpoint('customField'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        if (!$json || !isset($json->result)) {
            throw new IntegrationException('Could not fetch fields for Pardot Custom');
        }

        $fieldList = [];

        foreach ($json->result->customField as $field) {
            if (\is_array($field)) {
                $field = (object) $field;
            }

            if (!\is_object($field) || !isset($field->type)) {
                continue;
            }

            $type = null;

            switch ($field->data_type) {
                case 'Text':
                case 'Textarea':
                case 'TextArea':
                case 'Dropdown':
                case 'Radio Button':
                case 'Hidden':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'Checkbox':
                case 'Multi-Select':
                    $type = FieldObject::TYPE_ARRAY;

                    break;

                case 'Number':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldList[] = new FieldObject(
                $field->field_id,
                $field->name,
                $type,
                'Custom',
                false,
            );
        }

        return $fieldList;
    }
}
