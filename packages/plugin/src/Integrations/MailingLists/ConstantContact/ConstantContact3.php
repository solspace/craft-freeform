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
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListOAuthConnector;

#[Type(
    name: 'Constant Contact (v3)',
    iconPath: __DIR__.'/icon.jpeg',
)]
class ConstantContact3 extends MailingListOAuthConnector implements RefreshTokenInterface
{
    public const LOG_CATEGORY = 'Constant Contact';

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    public function checkConnection(bool $refreshTokenIfExpired = true): bool
    {
        // Having no Access Token is very likely because this is
        // an attempted connection right after a first save. The response
        // will definitely be an error so skip the connection in this
        // first-time connect situation.
        if ($this->getAccessToken()) {
            $client = $this->generateAuthorizedClient($refreshTokenIfExpired);
            $endpoint = $this->getEndpoint('/contact_lists');

            try {
                $response = $client->get($endpoint);
                $json = json_decode((string) $response->getBody(), false);

                return isset($json->lists);
            } catch (RequestException $exception) {
                throw new IntegrationException(
                    $exception->getMessage(),
                    $exception->getCode(),
                    $exception->getPrevious()
                );
            }
        }

        return false;
    }

    /**
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client = $this->generateAuthorizedClient();

        $values = [];
        foreach ($mappedValues as $key => $value) {
            if (preg_match('/^street_address_(.*)/', $key, $matches)) {
                if (!isset($values['street_address'])) {
                    $values['street_address'] = [];
                }

                $values['street_address'][$matches[1]] = $value;
            } elseif (preg_match('/^custom_(.*)/', $key, $matches)) {
                if (!isset($values['custom_fields'])) {
                    $values['custom_fields'] = [];
                }

                $values['custom_fields'][] = ['custom_field_id' => $matches[1], 'value' => $value];
            } else {
                $values[$key] = $value;
            }
        }

        if (isset($values['street_address']) && !isset($values['street_address']['kind'])) {
            $values['street_address']['kind'] = 'home';
        }

        try {
            $data = array_merge(
                [
                    'email_address' => $emails[0],
                    'create_source' => 'Contact',
                    'list_memberships' => [$mailingList->getId()],
                ],
                $values
            );

            $response = $client->post($this->getEndpoint('/contacts/sign_up_form'), ['json' => $data]);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $status = $response->getStatusCode();
        if (!\in_array($status, [200, 201])) { // 200 Contact successfully update, 201 Contact successfully created
            $this->getLogger()->error('Could not add contacts to list', ['response' => (string) $response->getBody()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not add emails to lists')
            );
        }

        return 201 === $status;
    }

    /**
     * Returns the API root url without endpoints specified.
     */
    public function getApiRootUrl(): string
    {
        return 'https://api.cc.email/v3';
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them.
     *
     * @return ListObject[]
     *
     * @throws IntegrationException
     */
    protected function fetchLists(): array
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/contact_lists');

        try {
            $response = $client->get($endpoint);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $status = $response->getStatusCode();
        if (200 !== $status) {
            $this->getLogger()->error(
                'Could not fetch Constant Contact lists',
                ['response' => (string) $response->getBody()]
            );

            throw new IntegrationException(
                $this->getTranslator()->translate(
                    'Could not fetch {serviceProvider} lists',
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $json = json_decode((string) $response->getBody(), false);

        $lists = [];
        foreach ($json->lists as $list) {
            if (isset($list->list_id, $list->name)) {
                $lists[] = new ListObject(
                    $this,
                    $list->list_id,
                    $list->name,
                    $this->fetchFields($list->list_id)
                );
            }
        }

        return $lists;
    }

    /**
     * Fetch all custom fields for each list.
     *
     * @return FieldObject[]
     *
     * @throws GuzzleException|IntegrationException
     */
    protected function fetchFields(string $listId): array
    {
        static $cachedFields;

        if (null === $cachedFields) {
            $client = $this->generateAuthorizedClient();
            $endpoint = $this->getEndpoint('/contact_custom_fields');

            try {
                $response = $client->get($endpoint);
            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();
                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

                throw new IntegrationException(
                    $this->getTranslator()->translate('Could not connect to API endpoint')
                );
            }

            $fields = [
                new FieldObject('first_name', 'First Name', FieldObject::TYPE_STRING, false),
                new FieldObject('last_name', 'Last Name', FieldObject::TYPE_STRING, false),
                new FieldObject('job_title', 'Job Title', FieldObject::TYPE_STRING, false),
                new FieldObject('company_name', 'Company Name', FieldObject::TYPE_STRING, false),
                new FieldObject('phone_number', 'Phone Number', FieldObject::TYPE_STRING, false),
                new FieldObject('anniversary', 'Anniversary', FieldObject::TYPE_STRING, false),
                new FieldObject('birthday_month', 'Birthday Month', FieldObject::TYPE_NUMERIC, false),
                new FieldObject('birthday_day', 'Birthday Day', FieldObject::TYPE_NUMERIC, false),
                new FieldObject('street_address_kind', 'Address: Kind', FieldObject::TYPE_STRING, false),
                new FieldObject('street_address_street', 'Address: Street', FieldObject::TYPE_STRING, false),
                new FieldObject('street_address_city', 'Address: City', FieldObject::TYPE_STRING, false),
                new FieldObject('street_address_state', 'Address: State', FieldObject::TYPE_STRING, false),
                new FieldObject('street_address_postal_code', 'Address: Postal Code', FieldObject::TYPE_STRING, false),
                new FieldObject('street_address_country', 'Address: Country', FieldObject::TYPE_STRING, false),
            ];

            $json = json_decode((string) $response->getBody(), false);
            foreach ($json->custom_fields as $field) {
                $fields[] = new FieldObject(
                    'custom_'.$field->custom_field_id,
                    $field->label,
                    FieldObject::TYPE_STRING,
                    false
                );
            }

            $cachedFields = $fields;
        }

        return $cachedFields;
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    protected function getAuthorizeUrl(): string
    {
        return 'https://authz.constantcontact.com/oauth2/default/v1/authorize';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    protected function getAccessTokenUrl(): string
    {
        return 'https://authz.constantcontact.com/oauth2/default/v1/token';
    }

    /**
     * @throws IntegrationException
     */
    private function getRefreshedAccessToken(): string
    {
        if (!$this->getRefreshToken() || !$this->getClientId() || !$this->getClientSecret()) {
            $this->getLogger()->warning(
                'Trying to refresh Constant Contact access token with no credentials present'
            );

            return 'invalid';
        }

        $client = new Client();
        $payload = [
            'grant_type' => 'refresh_token',
            'refresh_token' => $this->getRefreshToken(),
        ];

        try {
            $response = $client->post(
                $this->getAccessTokenUrl(),
                [
                    'auth' => [$this->getClientId(), $this->getClientSecret()],
                    'form_params' => $payload,
                ]
            );

            $json = json_decode((string) $response->getBody());
            if (!isset($json->access_token)) {
                throw new IntegrationException(
                    $this->getTranslator()->translate("No 'access_token' present in auth response for Constant Contact")
                );
            }

            $this->setAccessToken($json->access_token);
            $this->setRefreshToken($json->refresh_token);

            // The Record isn't being updated, as it would be with a regular
            // form save, so we need to update the Record ourselves.
            $this->updateAccessToken();
            $this->updateSettings();

            return $this->getAccessToken();
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $e->getMessage(),
                $e->getCode(),
                $e->getPrevious()
            );
        }
    }
}
