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

namespace Solspace\Freeform\Integrations\MailingLists\CampaignMonitor;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegration;

#[Type(
    name: 'Campaign Monitor',
    iconPath: __DIR__.'/icon.svg',
)]
class CampaignMonitor extends MailingListIntegration
{
    public const LOG_CATEGORY = 'Campaign Monitor';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your Campaign Monitor API key here.',
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Enter your Campaign Monitor Client ID here.',
    )]
    protected string $clientId = '';

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function getClientId(): string
    {
        return $this->getProcessedValue($this->clientId);
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(Client $client): bool
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get($this->getEndpoint('/clients/'.$this->getClientID().'.json'));

            $json = json_decode((string) $response->getBody());

            return isset($json->ApiKey) && !empty($json->ApiKey);
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
    public function push(Form $form, Client $client): void
    {
        return;
        $endpoint = $this->getEndpoint("/subscribers/{$mailingList->getId()}.json");

        try {
            $customFields = [];
            foreach ($mappedValues as $key => $value) {
                if ('Name' === $key) {
                    continue;
                }

                if (\is_array($value)) {
                    foreach ($value as $subValue) {
                        $customFields[] = [
                            'Key' => $key,
                            'Value' => $subValue,
                        ];
                    }
                } else {
                    $customFields[] = [
                        'Key' => $key,
                        'Value' => $value,
                    ];
                }
            }

            foreach ($emails as $email) {
                $data = [
                    'EmailAddress' => $email,
                    'Name' => $mappedValues['Name'] ?? '',
                    'CustomFields' => $customFields,
                    'Resubscribe' => true,
                    'RestartSubscriptionBasedAutoresponders' => true,
                ];

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
    }

    // TODO: move to event listener
    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'auth' => [$this->getApiKey(), 'freeform'],
        ]);
    }

    /**
     * Returns the API root url without endpoints specified.
     *
     * @throws IntegrationException
     */
    public function getApiRootUrl(): string
    {
        return 'https://api.createsend.com/api/v3.1/';
    }

    public function fetchLists(Client $client): array
    {
        $endpoint = $this->getEndpoint('/clients/'.$this->getClientID().'/lists.json');

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
            throw new IntegrationException(
                $this->getTranslator()->translate(
                    'Could not fetch {serviceProvider} lists',
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];
        if (\is_array($json)) {
            foreach ($json as $list) {
                if (isset($list->ListID, $list->Name)) {
                    $lists[] = new ListObject(
                        $this,
                        $list->ListID,
                        $list->Name,
                        $this->fetchFields($list->ListID),
                        0
                    );
                }
            }
        }

        return $lists;
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        $endpoint = $this->getEndpoint("/lists/{$listId}/customfields.json");

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

        $fieldList = [
            new FieldObject('Name', 'Name', FieldObject::TYPE_STRING, false),
        ];

        if (\is_array($json)) {
            foreach ($json as $field) {
                $type = match ($field->DataType) {
                    'Text', 'MultiSelectOne' => FieldObject::TYPE_STRING,
                    'Number' => FieldObject::TYPE_NUMERIC,
                    'MultiSelectMany' => FieldObject::TYPE_ARRAY,
                    'Date' => FieldObject::TYPE_DATE,
                    default => null,
                };

                if (null === $type) {
                    continue;
                }

                $fieldList[] = new FieldObject(
                    str_replace(['[', ']'], '', $field->Key),
                    $field->FieldName,
                    $type,
                    false
                );
            }
        }

        return $fieldList;
    }
}
