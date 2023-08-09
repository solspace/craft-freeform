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

namespace Solspace\Freeform\Integrations\MailingLists\Dotmailer;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegration;

#[Type(
    name: 'Dotdigital',
    iconPath: __DIR__.'/icon.svg',
)]
class Dotmailer extends MailingListIntegration
{
    public const LOG_CATEGORY = 'Dotdigital';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API User Email',
        instructions: 'Enter your Dotdigital API user email.',
    )]
    protected string $userEmail = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Password',
        instructions: 'Enter your Dotdigital API user password',
    )]
    protected string $userPassword = '';

    #[Input\Boolean('Use double opt-in?')]
    protected bool $doubleOptIn = false;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $endpoint = '';

    public function getUserEmail(): string
    {
        return $this->getProcessedValue($this->userEmail);
    }

    public function getUserPassword(): string
    {
        return $this->getProcessedValue($this->userPassword);
    }

    public function isDoubleOptIn(): bool
    {
        return $this->doubleOptIn;
    }

    public function getVarEndpoint(): string
    {
        return $this->endpoint;
    }

    public function initiateAuthentication(): void
    {
    }

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/account-info'));
            $json = json_decode((string) $response->getBody());

            return isset($json->id) && !empty($json->id);
        } catch (RequestException $e) {
            $this->getLogger()->error((string) $e->getRequest()->getBody());

            throw new IntegrationException($e->getMessage(), $e->getCode(), $e->getPrevious());
        }
    }

    /**
     * Push emails to a specific mailing list for the service provider.
     *
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/address-books/'.$mailingList->getId().'/contacts');

        try {
            foreach ($emails as $email) {
                $data = [
                    'email' => $email,
                    'optInType' => $this->isDoubleOptIn() ? 'verifiedDouble' : 'single',
                ];

                if ($mappedValues) {
                    $data['dataFields'] = [];
                    foreach ($mappedValues as $key => $value) {
                        $data['dataFields'][] = [
                            'key' => $key,
                            'value' => $value,
                        ];
                    }
                }

                $response = $client->post($endpoint, ['json' => $data]);

                $this->getHandler()->onAfterResponse($this, $response);
            }
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        return true;
    }

    /**
     * Perform anything necessary before this integration is saved.
     *
     * @throws IntegrationException
     */
    public function onBeforeSave(Client $client): void
    {
        $endpoint = 'https://api.dotmailer.com/v2/account-info';

        try {
            $response = $client->get($endpoint);
            $json = json_decode((string) $response->getBody());

            if (isset($json->properties)) {
                foreach ($json->properties as $property) {
                    if ('ApiEndpoint' === $property->name) {
                        $this->endpoint = $property->value;

                        return;
                    }
                }
            }
        } catch (BadResponseException $e) {
        }

        throw new IntegrationException('Could not get an API endpoint');
    }

    /**
     * Returns the API root url without endpoints specified.
     */
    public function getApiRootUrl(): string
    {
        return rtrim($this->getVarEndpoint(), '/').'/v2/';
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client(
            ['auth' => [$this->getUserEmail(), $this->getUserPassword()]]
        );
    }

    /**
     * Makes an API call that fetches mailing lists
     * Builds ListObject objects based on the results
     * And returns them.
     *
     * @return \Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject[]
     *
     * @throws IntegrationException
     */
    protected function fetchLists(): array
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/address-books');

        try {
            $response = $client->get($endpoint, ['query' => ['select' => 1000]]);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        if (200 !== $response->getStatusCode()) {
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
                    $list->contacts
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
     *
     * @throws IntegrationException
     */
    protected function fetchFields($listId): array
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/data-fields');

        try {
            $response = $client->get($endpoint);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            throw new IntegrationException(
                $this->getTranslator()->translate('Could not connect to API endpoint')
            );
        }

        $json = json_decode((string) $response->getBody());

        if ($json) {
            $fieldList = [];
            foreach ($json as $field) {
                $type = match ($field->type) {
                    'String', 'Date' => FieldObject::TYPE_STRING,
                    'Boolean' => FieldObject::TYPE_BOOLEAN,
                    'Numeric' => FieldObject::TYPE_NUMERIC,
                    default => null,
                };

                if (null === $type) {
                    continue;
                }

                $fieldList[] = new FieldObject(
                    $field->name,
                    $field->name,
                    $type,
                    false
                );
            }

            return $fieldList;
        }

        return [];
    }
}
