<?php

namespace Solspace\Freeform\Integrations\CRM\Insightly;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Type('Insightly')]
class Insightly extends CRMIntegration
{
    public const LOG_CATEGORY = 'Insightly';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your Insightly API key here.',
    )]
    protected string $apiKey = '';

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function initiateAuthentication(): void
    {
    }

    /**
     * Push objects to the CRM.
     *
     * @param null|mixed $formFields
     */
    public function push(array $keyValueList, $formFields = null): bool
    {
        $response = $this
            ->generateAuthorizedClient()
            ->post(
                $this->getEndpoint('/Leads'),
                ['json' => $keyValueList]
            )
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $response = $this
            ->generateAuthorizedClient()
            ->get($this->getEndpoint('/Leads'))
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $fieldList = [
            new FieldObject('SALUTATION', 'Salutation', FieldObject::TYPE_STRING),
            new FieldObject('FIRST_NAME', 'First Name', FieldObject::TYPE_STRING),
            new FieldObject('LAST_NAME', 'Last Name', FieldObject::TYPE_STRING),
            new FieldObject('TITLE', 'Title', FieldObject::TYPE_STRING),
            new FieldObject('EMAIL', 'Email', FieldObject::TYPE_STRING),
            new FieldObject('PHONE', 'Phone', FieldObject::TYPE_STRING),
            new FieldObject('MOBILE', 'Mobile', FieldObject::TYPE_STRING),
            new FieldObject('FAX', 'Fax', FieldObject::TYPE_STRING),
            new FieldObject('WEBSITE', 'Website', FieldObject::TYPE_STRING),
            new FieldObject('ORGANISATION_NAME', 'Organisation Name', FieldObject::TYPE_STRING),
            new FieldObject('INDUSTRY', 'Industry', FieldObject::TYPE_STRING),
            new FieldObject('EMPLOYEE_COUNT', 'Employee Count', FieldObject::TYPE_STRING),
            new FieldObject('IMAGE_URL', 'Image URL', FieldObject::TYPE_STRING),
            new FieldObject('ADDRESS_STREET', 'Address - Street', FieldObject::TYPE_STRING),
            new FieldObject('ADDRESS_CITY', 'Address - City', FieldObject::TYPE_STRING),
            new FieldObject('ADDRESS_STATE', 'Address - State', FieldObject::TYPE_STRING),
            new FieldObject('ADDRESS_POSTCODE', 'Address - Postcode', FieldObject::TYPE_STRING),
            new FieldObject('ADDRESS_COUNTRY', 'Address - Country', FieldObject::TYPE_STRING),
            new FieldObject('LEAD_DESCRIPTION', 'Lead Description', FieldObject::TYPE_STRING),
            new FieldObject('LEAD_RATING', 'Lead Rating', FieldObject::TYPE_STRING),
        ];

        $response = $this
            ->generateAuthorizedClient()
            ->get($this->getEndpoint('/CustomFields/Leads'))
        ;

        $data = json_decode($response->getBody(), false);
        foreach ($data as $field) {
            if (!$field->EDITABLE) {
                continue;
            }

            $type = null;

            switch ($field->FIELD_TYPE) {
                case 'TEXT':
                case 'DROPDOWN':
                case 'URL':
                case 'MULTILINETEXT':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'DATE':
                    $type = FieldObject::TYPE_DATETIME;

                    break;

                case 'BIT':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'NUMERIC':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                $field->FIELD_NAME,
                $field->FIELD_LABEL,
                $type,
                false
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.insightly.com/v3.0/';
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'headers' => ['Content-Type' => 'application/json'],
            'auth' => [$this->getApiKey(), ''],
        ]);
    }
}
