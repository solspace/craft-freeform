<?php

namespace Solspace\Freeform\Integrations\MailingLists;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class ActiveCampaign extends AbstractMailingListIntegration
{
    const SETTING_API_URL = 'api_url';
    const SETTING_API_KEY = 'api_key';

    const TITLE        = 'ActiveCampaign';
    const LOG_CATEGORY = 'ActiveCampaign';

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
                self::SETTING_API_URL,
                'API URL',
                'Enter your ActiveCampaign API Access URL here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_API_KEY,
                'API Key',
                'Enter your ActiveCampaign API key here.',
                true
            ),
        ];
    }

    /**
     * @param ListObject $mailingList
     * @param array      $emails
     * @param array      $mappedValues
     *
     * @return bool
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/contact/sync');

        $contactId = null;

        /**
         * Create contact with standard fields
         */
        try {
            $email       = reset($emails);
            $contactData = ['contact' => array_merge(['email' => $email], $mappedValues)];

            $response = $client->post($endpoint, ['json' => $contactData]);
            $this->getHandler()->onAfterResponse($this, $response);

            $json      = \GuzzleHttp\json_decode($response->getBody());
            $contactId = $json->contact->id;
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }

        // Remove generic Contact Fields
        unset($mappedValues['firstName'], $mappedValues['lastName'], $mappedValues['phone']);

        $endpoint = $this->getEndpoint('/contactLists');
        $payload  = [
            'contactList' => [
                'list'    => $mailingList->getId(),
                'contact' => $contactId,
                'status'  => 1,
            ],
        ];

        try {
            $response = $client->post($endpoint, ['json' => $payload]);
            $this->getHandler()->onAfterResponse($this, $response);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }

        $endpoint = $this->getEndpoint('/fieldValues');
        foreach ($mappedValues as $key => $value) {
            $fieldId = (string) $key;

            if (is_array($value)) {
                $value = '||' . implode('||', $value) . '||';
            }

            $customField = [
                'fieldValue' => [
                    'contact' => $contactId,
                    'field'   => $fieldId,
                    'value'   => $value,
                ],
            ];

            try {
                $response = $client->post($endpoint, ['json' => $customField]);
                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $exception) {
                throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
            }
        }

        return (bool) $contactId;
    }

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     */

    public function checkConnection(): bool
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/lists?limit=50');

        try {
            $response = $client->get($endpoint);
            $json     = json_decode((string) $response->getBody(), true);

            return isset($json['lists']);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * @inheritDoc
     */
    protected function fetchLists(): array
    {
        $client   = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/lists?limit=50');

        try {
            $response = $client->get($endpoint);
        } catch (RequestException $exception) {
            $responseBody = (string) $exception->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $exception->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $json = \GuzzleHttp\json_decode((string) $response->getBody());

        $lists = [];
        foreach ($json->lists as $list) {
            $lists[] = new ListObject(
                $this,
                $list->id,
                $list->name,
                $this->fetchFields($list->id)
            );
        }

        return $lists;
    }

    /**
     * Fetch the custom fields from the integration
     *
     * @param $listId
     *
     * @return FieldObject[]
     */
    public function fetchFields($listId): array
    {
        $fieldList = [
            new FieldObject('firstName', 'First Name', FieldObject::TYPE_STRING, false),
            new FieldObject('lastName', 'Last Name', FieldObject::TYPE_STRING, false),
            new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING, false),
        ];

        $client   = $this->generateAuthorizedClient();
        $response = $client->get($this->getEndpoint('/fields?limit=50'));

        $data = json_decode((string) $response->getBody());
        $data = $data->fields;

        foreach ($data as $field) {
            $type = null;
            switch ($field->type) {
                case 'text':
                case 'textarea':
                case 'hidden':
                case 'dropdown':
                case 'radio':
                    $type = FieldObject::TYPE_STRING;
                    break;

                case 'date':
                    $type = FieldObject::TYPE_DATE;
                    break;

                case 'checkbox':
                case 'listbox':
                    $type = FieldObject::TYPE_ARRAY;
                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                $field->id,
                $field->title,
                $type,
                false
            );

            $fieldList[] = $fieldObject;
        }

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
        return $this->getSetting(self::SETTING_API_URL) . '/api/3/';
    }

    /**
     * @return Client
     */
    private function generateAuthorizedClient(): Client
    {
        return new Client(['headers' => ['Api-Token' => $this->getSetting(self::SETTING_API_KEY)]]);
    }
}

