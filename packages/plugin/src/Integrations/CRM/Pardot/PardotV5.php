<?php

namespace Solspace\Freeform\Integrations\CRM\Pardot;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;

#[Type(
    name: 'Pardot (v5)',
    iconPath: __DIR__.'/../Salesforce/icon.svg',
)]
class PardotV5 extends CRMOAuthConnector implements RefreshTokenInterface
{
    public const LOG_CATEGORY = 'Pardot';

    #[Validators\Required]
    #[Input\Text(
        label: 'Pardot Business Unit ID',
        instructions: 'Enter your Pardot business unit ID here',
    )]
    protected string $businessUnitId = '';

    public function getBusinessUnitId(): string
    {
        return $this->getProcessedValue($this->businessUnitId);
    }

    /**
     * Push objects to the CRM.
     *
     * @param null $formFields
     */
    public function push(array $keyValueList, $formFields = null): bool
    {
        $email = null;
        foreach ($keyValueList as $key => $value) {
            if ('email' === $key) {
                $email = $value;
                unset($keyValueList[$key]);

                continue;
            }

            if (str_starts_with($key, 'custom___')) {
                unset($keyValueList[$key]);
                $keyValueList[str_replace('custom___', '', $key)] = $value;
            }
        }

        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getPardotEndpoint('prospect', 'create/email/'.$email);

        try {
            $response = $client->post(
                $endpoint,
                ['query' => $keyValueList]
            );

            $this->getHandler()->onAfterResponse($this, $response);

            return true;
        } catch (RequestException $exception) {
            $responseBody = (string) $exception->getRequest()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $exception->getMessage()]);
        }

        return false;
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getPardotEndpoint();

        try {
            $response = $client->get($endpoint, ['query' => ['limit' => 1, 'format' => 'json']]);

            $json = json_decode($response->getBody(), true);

            return isset($json['@attributes']) && 'ok' === $json['@attributes']['stat'];
        } catch (RequestException $e) {
            return false;
        }
    }

    /**
     * @return array|bool|string
     */
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field): mixed
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get($this->getPardotEndpoint('customField'));
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }

        $data = json_decode((string) $response->getBody());

        $fieldList = [
            new FieldObject(
                'salutation',
                'Salutation',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'first_name',
                'First Name',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'last_name',
                'Last Name',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'email',
                'Email',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'password',
                'Password',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'company',
                'Company',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'prospect_account_id',
                'Prospect Account Id',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'website',
                'Website',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'job_title',
                'Job Title',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'department',
                'Department',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'country',
                'Country',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'address_one',
                'Address One',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'address_two',
                'Address Two',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'city',
                'City',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'state',
                'State',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'territory',
                'Territory',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'zip',
                'Zip',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'phone',
                'Phone',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'fax',
                'Fax',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'source',
                'Source',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'annual_revenue',
                'Annual Revenue',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'employees',
                'Employees',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'industry',
                'Industry',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'years_in_business',
                'Years in Business',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'comments',
                'Comments',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'notes',
                'Notes',
                FieldObject::TYPE_STRING
            ),
            new FieldObject(
                'score',
                'Score',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'is_do_not_email',
                'Do not email',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_do_not_call',
                'Do not call',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_reviewed',
                'Reviewed',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_archived',
                'Archived',
                FieldObject::TYPE_BOOLEAN,
                true
            ),
            new FieldObject(
                'is_starred',
                'Starred',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'campaign_id',
                'Campaign',
                FieldObject::TYPE_NUMERIC,
                true
            ),
            new FieldObject(
                'profile',
                'Profile',
                FieldObject::TYPE_STRING,
                true
            ),
            new FieldObject(
                'assign_to',
                'Assign To',
                FieldObject::TYPE_STRING
            ),
        ];

        if (!$data || !isset($data->result)) {
            return $fieldList;
        }

        foreach ($data->result->customField as $field) {
            if (\is_array($field)) {
                $field = (object) $field;
            }

            if (!\is_object($field) || !isset($field->type)) {
                continue;
            }

            $type = match ($field->type) {
                'Text', 'Textarea', 'TextArea', 'Dropdown', 'Radio Button', 'Hidden' => FieldObject::TYPE_STRING,
                'Checkbox', 'Multi-Select' => FieldObject::TYPE_ARRAY,
                'Number' => FieldObject::TYPE_NUMERIC,
                'Date' => FieldObject::TYPE_DATE,
                default => null,
            };

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                'custom___'.$field->field_id,
                $field->name.' (Custom Fields)',
                $type
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    public function getApiRootUrl(): string
    {
        return 'https://pi.pardot.com/api/';
    }

    public function generateAuthorizedClient(): Client
    {
        parent::generateAuthorizedClient();

        return new Client([
            'headers' => [
                'Authorization' => 'Bearer '.$this->getAccessToken(),
                'Pardot-Business-Unit-Id' => $this->getBusinessUnitId(),
                'Content-Type' => 'application/json',
            ],
            'query' => [
                'format' => 'json',
            ],
        ]);
    }

    protected function getAuthorizeUrl(): string
    {
        return 'https://login.salesforce.com/services/oauth2/authorize';
    }

    protected function getAccessTokenUrl(): string
    {
        return 'https://login.salesforce.com/services/oauth2/token';
    }

    private function getPardotEndpoint(string $object = 'prospect', string $action = 'query'): string
    {
        $root = rtrim($this->getApiRootUrl(), '/');
        $object = trim($object, '/');
        $action = ltrim($action, '/');

        return "{$root}/{$object}/version/4/do/{$action}";
    }
}
