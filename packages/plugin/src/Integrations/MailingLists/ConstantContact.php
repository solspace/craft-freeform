<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\MailingLists;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\MailingLists\MailingListOAuthConnector;

class ConstantContact extends MailingListOAuthConnector
{
    const TITLE = 'Constant Contact (legacy)';
    const LOG_CATEGORY = 'Constant Contact (legacy)';

    /**
     * Returns the MailingList service provider short name
     * i.e. - MailChimp, Constant Contact, etc...
     */
    public function getServiceProvider(): string
    {
        return 'Constant Contact (legacy)';
    }

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    public function checkConnection(): bool
    {
        $client = new Client();
        $endpoint = $this->getEndpoint('/account/info');

        try {
            $response = $client->get(
                $endpoint,
                [
                    'query' => ['api_key' => $this->getClientId()],
                    'headers' => [
                        'Authorization' => 'Bearer '.$this->getAccessToken(),
                    ],
                ]
            );

            $json = json_decode((string) $response->getBody());

            return isset($json->email);
        } catch (RequestException $exception) {
            $responseBody = (string) $exception->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $exception->getMessage()]);

            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Push emails to a specific mailing list for the service provider.
     *
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client = new Client();

        try {
            $emailAddresses = [];
            foreach ($emails as $email) {
                $emailAddresses[] = ['email_address' => $email];
            }

            $data = array_merge(
                [
                    'email_addresses' => $emailAddresses,
                    'lists' => [['id' => $mailingList->getId()]],
                ],
                $mappedValues
            );

            $response = $client->post(
                $this->getEndpoint('/contacts'),
                [
                    'query' => ['api_key' => $this->getClientId()],
                    'headers' => [
                        'Authorization' => 'Bearer '.$this->getAccessToken(),
                    ],
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

        $status = $response->getStatusCode();
        if (201 !== $status) {
            $this->getLogger()->error('Could not add contacts to list', ['response' => (string) $response->getBody()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not add emails to lists')
            );
        }

        $this->getHandler()->onAfterResponse($this, $response);

        return 200 === $status;
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them.
     *
     * @throws IntegrationException
     *
     * @return ListObject[]
     */
    protected function fetchLists(): array
    {
        $client = new Client();
        $endpoint = $this->getEndpoint('/lists');

        try {
            $response = $client->get(
                $endpoint,
                [
                    'query' => ['api_key' => $this->getClientId()],
                    'headers' => [
                        'Authorization' => 'Bearer '.$this->getAccessToken(),
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

        $status = $response->getStatusCode();
        if (200 !== $status) {
            $this->getLogger()->error('Could not fetch MailChimp lists', ['response' => (string) $response->getBody()]);

            throw new IntegrationException(
                $this->getTranslator()->translate(
                    'Could not fetch {serviceProvider} lists',
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];
        foreach ($json as $list) {
            if (isset($list->id, $list->name)) {
                $lists[] = new ListObject(
                    $this,
                    $list->id,
                    $list->name,
                    $this->fetchFields($list->id),
                    $list->contact_count
                );
            }
        }

        return $lists;
    }

    /**
     * Fetch all custom fields for each list.
     *
     * @param string $listId
     *
     * @return FieldObject[]
     */
    protected function fetchFields($listId): array
    {
        return [
            new FieldObject('first_name', 'First Name', FieldObject::TYPE_STRING, false),
            new FieldObject('last_name', 'Last Name', FieldObject::TYPE_STRING, false),
            new FieldObject('job_title', 'Job Title', FieldObject::TYPE_STRING, false),
            new FieldObject('company_name', 'Company Name', FieldObject::TYPE_STRING, false),
            new FieldObject('cell_phone', 'Cell Phone', FieldObject::TYPE_STRING, false),
            new FieldObject('home_phone', 'Home Phone', FieldObject::TYPE_STRING, false),
            new FieldObject('fax', 'Fax', FieldObject::TYPE_STRING, false),
        ];
    }

    /**
     * Returns the API root url without endpoints specified.
     */
    protected function getApiRootUrl(): string
    {
        return 'https://api.constantcontact.com/v2/';
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    protected function getAuthorizeUrl(): string
    {
        return 'https://oauth2.constantcontact.com/oauth2/oauth/siteowner/authorize';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    protected function getAccessTokenUrl(): string
    {
        return 'https://oauth2.constantcontact.com/oauth2/oauth/token';
    }
}
