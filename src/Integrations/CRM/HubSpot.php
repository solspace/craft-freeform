<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Integrations\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class HubSpot extends AbstractCRMIntegration
{
    const SETTING_API_KEY  = 'api_key';
    const SETTING_IP_FIELD = 'ip_field';

    const TITLE        = 'HubSpot';
    const LOG_CATEGORY = 'HubSpot';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens
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
                'Enter your HubSpot API key here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_IP_FIELD,
                'IP Address Field',
                'Enter a custom HubSpot Contact field handle where you wish to store the client\'s IP address from the submission (optional).'
            ),
        ];
    }

    /**
     * Push objects to the CRM
     *
     * @param array $keyValueList
     *
     * @return bool
     */
    public function pushObject(array $keyValueList): bool
    {
        $client   = new Client();
        $endpoint = $this->getEndpoint('/deals/v1/deal/');

        $dealProps    = [];
        $contactProps = [];
        $companyProps = [];

        foreach ($keyValueList as $key => $value) {
            preg_match('/^(\w+)___(.+)$/', $key, $matches);

            list ($all, $target, $propName) = $matches;

            switch ($target) {
                case 'contact':
                    $contactProps[] = ['value' => $value, 'property' => $propName];
                    break;

                case 'company':
                    $companyProps[] = ['value' => $value, 'name' => $propName];
                    break;

                case 'deal':
                    $dealProps[] = ['value' => $value, 'name' => $propName];
                    break;
            }
        }

        $contactId = null;
        if ($contactProps) {
            if ($this->getSetting(self::SETTING_IP_FIELD) && isset($_SERVER['REMOTE_ADDR'])) {
                $contactProps[] = [
                    'value'    => $_SERVER['REMOTE_ADDR'],
                    'property' => $this->getSetting(self::SETTING_IP_FIELD),
                ];
            }

            try {
                $response = $client->post(
                    $this->getEndpoint('/contacts/v1/contact'),
                    [
                        'json'  => ['properties' => $contactProps],
                        'query' => ['hapikey' => $this->getAccessToken()],
                    ]
                );

                $json = json_decode((string) $response->getBody());
                if (isset($json->vid)) {
                    $contactId = $json->vid;
                }

                $this->getHandler()->onAfterResponse($this, $response);

            } catch (RequestException $e) {
                if ($e->getResponse()) {
                    $json = json_decode((string) $e->getResponse()->getBody());
                    if (isset($json->error, $json->identityProfile) && $json->error === 'CONTACT_EXISTS') {
                        $contactId = $json->identityProfile->vid;
                    } else {
                        $responseBody = (string) $e->getResponse()->getBody();

                        $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
                    }
                }
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        $companyId = null;
        if ($companyProps) {
            try {
                $response = $client->post(
                    $this->getEndpoint('companies/v2/companies'),
                    [
                        'json'  => ['properties' => $companyProps],
                        'query' => ['hapikey' => $this->getAccessToken()],
                    ]
                );

                $json = json_decode((string) $response->getBody());
                if (isset($json->companyId)) {
                    $companyId = $json->companyId;
                }

                $this->getHandler()->onAfterResponse($this, $response);

            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();

                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        if (!empty($dealProps)) {
            $deal = [
                'properties' => $dealProps,
            ];

            if ($companyId || $contactId) {
                $deal['associations'] = [];

                if ($companyId) {
                    $deal['associations']['associatedCompanyIds'] = [$companyId];
                }

                if ($contactId) {
                    $deal['associations']['associatedVids'] = [$contactId];
                }
            }

            $response = $client->post(
                $endpoint,
                [
                    'json'  => $deal,
                    'query' => ['hapikey' => $this->getAccessToken()],
                ]
            );

            $this->getHandler()->onAfterResponse($this, $response);

            return $response->getStatusCode() === 200;
        }

        return true;
    }

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     */
    public function checkConnection(): bool
    {
        $client   = new Client();
        $endpoint = $this->getEndpoint('/contacts/v1/lists/all/contacts/all');

        try {
            $response = $client->get(
                $endpoint,
                [
                    'query' => ['hapikey' => $this->getAccessToken()],
                ]
            );

            $json = json_decode((string) $response->getBody(), true);

            return isset($json['contacts']);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Fetch the custom fields from the integration
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $fieldList = [];
        $this->extractCustomFields(
            '/properties/v1/deals/properties/',
            'deal',
            $fieldList
        );

        $this->extractCustomFields(
            '/properties/v1/contacts/properties/',
            'contact',
            $fieldList
        );

        $this->extractCustomFields(
            '/properties/v1/companies/properties/',
            'company',
            $fieldList
        );

        return $fieldList;
    }

    /**
     * Authorizes the application
     * Returns the access_token
     *
     * @return string
     * @throws IntegrationException
     */
    public function fetchAccessToken(): string
    {
        return $this->getSetting(self::SETTING_API_KEY);
    }

    /**
     * A method that initiates the authentication
     */
    public function initiateAuthentication()
    {
    }

    /**
     * Perform anything necessary before this integration is saved
     *
     * @param IntegrationStorageInterface $model
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        $model->updateAccessToken($this->getSetting(self::SETTING_API_KEY));
    }

    /**
     * @return string
     */
    protected function getApiRootUrl(): string
    {
        return 'https://api.hubapi.com/';
    }

    /**
     * @param string $endpoint
     * @param string $dataType
     * @param array  $fieldList
     */
    private function extractCustomFields(string $endpoint, string $dataType, array &$fieldList)
    {
        $client   = new Client();
        $response = $client->get(
            $this->getEndpoint($endpoint),
            ['query' => ['hapikey' => $this->getAccessToken()]]
        );

        $data = json_decode((string) $response->getBody());

        foreach ($data as $field) {
            if ($field->readOnlyValue || $field->hidden || $field->calculated) {
                continue;
            }

            $type = null;
            switch ($field->type) {
                case 'string':
                case 'enumeration':
                case 'datetime':
                case 'phone_number':
                    $type = FieldObject::TYPE_STRING;
                    break;

                case 'bool':
                    $type = FieldObject::TYPE_BOOLEAN;
                    break;

                case 'number':
                    $type = FieldObject::TYPE_NUMERIC;
                    break;
            }

            if (null === $type) {
                continue;
            }

            $dataLabel   = ucfirst($dataType);
            $fieldObject = new FieldObject(
                $dataType . '___' . $field->name,
                $field->label . " ($dataLabel)",
                $type,
                false
            );

            $fieldList[] = $fieldObject;
        }
    }
}
