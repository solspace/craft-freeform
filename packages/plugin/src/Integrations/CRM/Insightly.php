<?php

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class Insightly extends AbstractCRMIntegration
{
    const SETTING_API_KEY = 'api_key';

    const TITLE = 'Insightly';
    const LOG_CATEGORY = 'Insightly';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens.
     *
     * @return SettingBlueprint[]
     */
    public static function getSettingBlueprints(): array
    {
        return [
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_API_KEY,
                'API Key',
                'Enter your Insightly API key here.',
                true
            ),
        ];
    }

    /**
     * Push objects to the CRM.
     *
     * @param null|mixed $formFields
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $response = $this
            ->getAuthorizedClient()
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
            ->getAuthorizedClient()
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
            ->getAuthorizedClient()
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

    /**
     * Authorizes the application
     * Returns the access_token.
     *
     * @throws IntegrationException
     */
    public function fetchAccessToken(): string
    {
        return $this->getSetting(self::SETTING_API_KEY);
    }

    /**
     * A method that initiates the authentication.
     */
    public function initiateAuthentication()
    {
    }

    /**
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        $model->updateAccessToken($this->getSetting(self::SETTING_API_KEY));
    }

    protected function getApiRootUrl(): string
    {
        return 'https://api.insightly.com/v3.0/';
    }

    private function getAuthorizedClient(): Client
    {
        return new Client([
            'headers' => ['Content-Type' => 'application/json'],
            'auth' => [$this->getAccessToken(), ''],
        ]);
    }
}
