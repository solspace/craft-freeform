<?php

namespace Solspace\Freeform\Integrations\MailingLists\ActiveCampaign;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\AbstractMailingListIntegration;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;

#[Type(
    name: 'ActiveCampaign',
    iconPath: __DIR__.'/icon.svg',
)]
class ActiveCampaign extends AbstractMailingListIntegration
{
    public const LOG_CATEGORY = 'ActiveCampaign';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API URL',
        instructions: 'Enter your ActiveCampaign API Access URL here.',
    )]
    protected string $apiUrl = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your ActiveCampaign API key here.',
    )]
    protected string $apiKey = '';

    public function getApiUrl(): string
    {
        return $this->getProcessedValue($this->apiUrl);
    }

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    /**
     * @throws IntegrationException
     */
    public function pushEmails(ListObject $mailingList, array $emails, array $mappedValues): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/contact/sync');

        $tags = [];
        if (isset($mappedValues['tags'])) {
            $initialTags = $mappedValues['tags'];
            foreach ($initialTags as $tag) {
                $tags = array_merge($tags, explode(';', $tag));
            }

            $tags = array_map('trim', $tags);

            unset($mappedValues['tags']);
        }

        // Create contact with standard fields
        try {
            $email = reset($emails);
            $contactData = ['contact' => array_merge(['email' => $email], $mappedValues)];

            $response = $client->post($endpoint, ['json' => $contactData]);
            $this->getHandler()->onAfterResponse($this, $response);

            $json = json_decode($response->getBody());
            $contactId = $json->contact->id;
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }

        // Remove generic Contact Fields
        unset($mappedValues['firstName'], $mappedValues['lastName'], $mappedValues['phone']);

        $endpoint = $this->getEndpoint('/contactLists');
        $payload = [
            'contactList' => [
                'list' => $mailingList->getId(),
                'contact' => $contactId,
                'status' => 1,
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

            if (\is_array($value)) {
                $value = '||'.implode('||', $value).'||';
            }

            $customField = [
                'fieldValue' => [
                    'contact' => $contactId,
                    'field' => $fieldId,
                    'value' => $value,
                ],
            ];

            try {
                $response = $client->post($endpoint, ['json' => $customField]);
                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $exception) {
                throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
            }
        }

        if ($contactId && $tags) {
            foreach ($tags as $tag) {
                $tagId = $this->getTagId($tag, $client);
                if ($tagId) {
                    try {
                        $client->post(
                            $this->getEndpoint('/contactTags'),
                            ['json' => ['contactTag' => ['contact' => $contactId, 'tag' => $tagId]]]
                        );
                    } catch (RequestException $exception) {
                    }
                }
            }
        }

        return (bool) $contactId;
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/lists?limit=50');

        try {
            $response = $client->get($endpoint);
            $json = json_decode((string) $response->getBody(), true);

            return isset($json['lists']);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @param mixed $listId
     *
     * @return FieldObject[]
     */
    public function fetchFields($listId): array
    {
        $fieldList = [
            new FieldObject('firstName', 'First Name', FieldObject::TYPE_STRING, false),
            new FieldObject('lastName', 'Last Name', FieldObject::TYPE_STRING, false),
            new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING, false),
            new FieldObject('tags', 'Tags', FieldObject::TYPE_ARRAY, false),
        ];

        $client = $this->generateAuthorizedClient();
        $response = $client->get($this->getEndpoint('/fields?limit=999'));

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
     * {@inheritDoc}
     */
    protected function fetchLists(): array
    {
        $client = $this->generateAuthorizedClient();

        $limit = 100;
        $offset = 0;

        $lists = [];
        while (null !== $offset) {
            $endpoint = $this->getEndpoint("/lists?limit={$limit}&offset={$offset}&orders[name]=ASC");

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

            $offset += $limit;

            $total = (int) $json->meta->total;
            if ($total <= $offset) {
                $offset = null;
            }

            foreach ($json->lists as $list) {
                $lists[] = new ListObject(
                    $this,
                    $list->id,
                    $list->name,
                    $this->fetchFields($list->id)
                );
            }
        }

        return $lists;
    }

    protected function getApiRootUrl(): string
    {
        return $this->getApiUrl().'/api/3/';
    }

    protected function generateAuthorizedClient(): Client
    {
        return new Client([
            'headers' => ['Api-Token' => $this->getApiKey()],
        ]);
    }

    private function getTagId(string $name, Client $client): mixed
    {
        static $tags;

        if (null === $tags) {
            $existingTags = $this->fetchTags($client);
            $tags = [];

            foreach ($existingTags as $item) {
                if ('contact' !== $item->tagType) {
                    continue;
                }

                $tags[$item->id] = $item->tag;
            }
        }

        foreach ($tags as $id => $tag) {
            if (strtolower($name) === strtolower($tag)) {
                return $id;
            }
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/tags'),
                ['json' => ['tag' => ['tag' => $name, 'tagType' => 'contact', 'description' => '']]]
            );
            $data = json_decode($response->getBody());

            return $data->tag->id;
        } catch (RequestException $exception) {
            return null;
        }
    }

    private function fetchTags(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/tags'));
            $data = json_decode($response->getBody());
            $tags = $data->tags;
            $tagsTotal = $data->meta->total;
            $tagsCount = \count($tags);
            $offset = $tagsCount;

            while ($tagsCount < $tagsTotal) {
                $response = $client->get($this->getEndpoint('/tags?offset='.$offset));
                $data = json_decode($response->getBody());
                $count = \count($data->tags);
                $tagsCount += $count;
                $tags = array_merge($tags, $data->tags);
                $offset += $count;
            }
        } catch (RequestException $exception) {
            return [];
        }

        return $tags;
    }
}
