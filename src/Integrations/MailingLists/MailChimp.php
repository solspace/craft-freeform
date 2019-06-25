<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\MailingLists;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class MailChimp extends AbstractMailingListIntegration
{
    const SETTING_API_KEY       = 'api_key';
    const SETTING_DOUBLE_OPT_IN = 'double_opt_in';
    const SETTING_DATA_CENTER   = 'data_center';

    const TITLE        = 'MailChimp';
    const LOG_CATEGORY = 'MailChimp';

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
                'Enter your MailChimp API key here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_DOUBLE_OPT_IN,
                'Use double opt-in?',
                '',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_DATA_CENTER,
                'Data Center',
                'This will be fetched automatically upon authorizing your credentials.',
                false
            ),
        ];
    }

    /**
     * Check if it's possible to connect to the API
     *
     * @return bool
     * @throws IntegrationException
     */
    public function checkConnection(): bool
    {
        $client = new Client();

        try {
            $response = $client->get(
                $this->getEndpoint('/'),
                [
                    'auth' => ['mailchimp', $this->getAccessToken()],
                ]
            );

            $json = json_decode((string) $response->getBody());

            if (isset($json->error) && !empty($json->error)) {
                throw new IntegrationException($json->error);
            }

            return isset($json->account_id) && !empty($json->account_id);
        } catch (RequestException $e) {
            $this->getLogger()->error((string) $e->getRequest()->getBody());

            throw new IntegrationException($e->getMessage(), $e->getCode(), $e->getPrevious());
        }
    }

    /**
     * Push emails to a specific mailing list for the service provider
     *
     * @param ListObject $mailingList
     * @param array      $emails
     * @param array      $mappedValues
     *
     * @return bool
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client   = new Client();
        $endpoint = $this->getEndpoint("lists/{$mailingList->getId()}");

        $isDoubleOptIn = $this->getSetting(self::SETTING_DOUBLE_OPT_IN);

        try {
            $members = [];
            foreach ($emails as $email) {
                $memberData = [
                    'email_address' => $email,
                    'status'        => $isDoubleOptIn ? 'pending' : 'subscribed',
                ];

                if (!empty($mappedValues)) {
                    $memberData['merge_fields'] = $mappedValues;
                }

                $members[] = $memberData;
            }

            $data = ['members' => $members, 'update_existing' => true];

            $response = $client->post(
                $endpoint,
                [
                    'auth' => ['mailchimp', $this->getAccessToken()],
                    'json' => $data,
                ]
            );
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $statusCode = $response->getStatusCode();
        if ($statusCode !== 200) {
            $this->getLogger()->error('Could not add emails to lists', ['response' => (string) $response->getBody()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not add emails to lists')
            );
        }

        $jsonResponse = json_decode((string) $response->getBody());
        if (isset($jsonResponse->error_count) && $jsonResponse->error_count > 0) {
            $this->getLogger()->error(json_encode($jsonResponse->errors), ['response' => $jsonResponse]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not add emails to lists')
            );
        }

        $this->getHandler()->onAfterResponse($this, $response);

        return $statusCode === 200;
    }

    /**
     * A method that initiates the authentication
     */
    public function initiateAuthentication()
    {
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
     * Perform anything necessary before this integration is saved
     *
     * @param IntegrationStorageInterface $model
     *
     * @throws IntegrationException
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        if (preg_match('/([a-zA-Z]+[\d]+)$/', $this->getSetting(self::SETTING_API_KEY), $matches)) {
            $dataCenter = $matches[1];
            $this->setSetting(self::SETTING_DATA_CENTER, $dataCenter);
        } else {
            throw new IntegrationException('Could not detect data center for MailChimp');
        }

        $model->updateAccessToken($this->getSetting(self::SETTING_API_KEY));
        $model->updateSettings($this->getSettings());
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them
     *
     * @return \Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject[]
     * @throws IntegrationException
     */
    protected function fetchLists(): array
    {
        $client   = new Client();
        $endpoint = $this->getEndpoint('/lists');

        try {
            $response = $client->get(
                $endpoint,
                [
                    'auth'  => ['mailchimp', $this->getAccessToken()],
                    'query' => [
                        'fields' => 'lists.id,lists.name,lists.stats.member_count',
                        'count'  => 999,
                    ],
                ]
            );
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        if ($response->getStatusCode() !== 200) {
            throw new IntegrationException(
                $this->getTranslator()->translate(
                    'Could not fetch {serviceProvider} lists',
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];
        if (isset($json->lists)) {
            foreach ($json->lists as $list) {
                if (isset($list->id, $list->name)) {
                    $lists[] = new ListObject(
                        $this,
                        $list->id,
                        $list->name,
                        $this->fetchFields($list->id),
                        $list->stats->member_count
                    );
                }
            }
        }

        return $lists;
    }

    /**
     * Fetch all custom fields for each list
     *
     * @param string $listId
     *
     * @return FieldObject[]
     * @throws IntegrationException
     */
    protected function fetchFields($listId): array
    {
        $client   = new Client();
        $endpoint = $this->getEndpoint("/lists/$listId/merge-fields");

        try {
            $response = $client->get(
                $endpoint,
                [
                    'auth'  => ['mailchimp', $this->getAccessToken()],
                    'query' => [
                        'count' => 999,
                    ],
                ]
            );
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $json = json_decode((string) $response->getBody());

        if (isset($json->merge_fields)) {
            $fieldList = [];
            foreach ($json->merge_fields as $field) {
                switch ($field->type) {
                    case 'text':
                    case 'website':
                    case 'url':
                    case 'dropdown':
                    case 'radio':
                    case 'date':
                    case 'zip':
                        $type = FieldObject::TYPE_STRING;
                        break;

                    case 'number':
                    case 'phone':
                        $type = FieldObject::TYPE_NUMERIC;
                        break;

                    default:
                        $type = null;
                        break;
                }

                if (null === $type) {
                    continue;
                }

                $fieldList[] = new FieldObject(
                    $field->tag,
                    $field->name,
                    $type,
                    $field->required
                );
            }

            return $fieldList;
        }

        return [];
    }

    /**
     * Returns the API root url without endpoints specified
     *
     * @return string
     * @throws IntegrationException
     */
    protected function getApiRootUrl(): string
    {
        $dataCenter = $this->getSetting(self::SETTING_DATA_CENTER);

        if (empty($dataCenter)) {
            throw new IntegrationException(
                $this->getTranslator()->translate('Could not detect data center for MailChimp')
            );
        }

        return "https://$dataCenter.api.mailchimp.com/3.0/";
    }
}
