<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\MailerLite;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'MailerLite',
    type: Type::TYPE_EMAIL_MARKETING,
    version: '2026-09-17',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class MailerLite extends EmailMarketingIntegration implements MailerLiteIntegrationInterface
{
    public const CATEGORY_SUBSCRIBER = 'subscriber';

    protected const LOG_CATEGORY = 'MailerLite';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your API Key here.',
        order: 1,
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Subscriber Fields',
        instructions: 'Select the Freeform fields to map to MailerLite subscriber fields.',
        order: 5,
        source: 'api/integrations/email-marketing/fields/'.self::CATEGORY_SUBSCRIBER,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $fieldMapping = null;

    public function getApiKey(): string
    {
        return (string) $this->getProcessedValue($this->apiKey);
    }

    public function getApiRootUrl(): string
    {
        return 'https://connect.mailerlite.com/api';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/groups'), ['query' => ['limit' => 1]]);

        return 200 === $response->getStatusCode();
    }

    public function fetchLists(Client $client): array
    {
        $lists = [];
        foreach ($this->fetchCollection($client, '/groups') as $group) {
            if (!isset($group['id'], $group['name'])) {
                throw new IntegrationException('MailerLite returned an invalid group.');
            }

            $lists[] = new ListObject((string) $group['id'], $group['name'], (int) ($group['active_count'] ?? 0));
        }

        return $lists;
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        if (self::CATEGORY_SUBSCRIBER !== $category) {
            return [];
        }

        $fields = [];
        foreach ($this->fetchCollection($client, '/fields') as $field) {
            if (!isset($field['key'], $field['name'], $field['type'])) {
                throw new IntegrationException('MailerLite returned an invalid subscriber field.');
            }

            if (!\in_array($field['type'], ['text', 'number', 'date'], true)) {
                continue;
            }

            // MailerLite accepts numeric strings. Preserve zero, signs and decimals instead
            // of using the shared numeric converter, which strips these values.
            $type = 'date' === $field['type'] ? FieldObject::TYPE_DATE : FieldObject::TYPE_STRING;
            $fields[] = new FieldObject($field['key'], $field['name'], $type, $category);
        }

        return $fields;
    }

    public function push(Form $form, Client $client): void
    {
        if (!$this->mailingList || !$this->emailField || !$this->mailingList->getResourceId()) {
            $this->logger->debug('Mailing list or email field not set. Skipping.');

            return;
        }

        if ($this->optInField && !$form->get($this->optInField->getUid())?->getValue()) {
            $this->logger->debug('Opt-in field used but not chosen. Skipping.');

            return;
        }

        $email = $form->get($this->emailField->getUid())?->getValue();
        if (!\is_string($email) || '' === trim($email)) {
            $this->logger->debug('Email field empty. Skipping.');

            return;
        }

        $payload = [
            'email' => trim($email),
            'groups' => [$this->mailingList->getResourceId()],
        ];

        $fields = $this->processMapping($form, $this->fieldMapping, self::CATEGORY_SUBSCRIBER);
        $fields = array_map(static fn ($value) => \is_string($value) ? trim($value) : $value, $fields);
        $fields = array_filter($fields, static fn ($value) => null !== $value && '' !== $value);
        if ($fields) {
            $payload['fields'] = (object) $fields;
        }

        // Upserts add group memberships without removing existing ones. Omit status and
        // resubscribe so MailerLite controls confirmation and existing subscription status.
        $response = $client->post($this->getEndpoint('/subscribers'), ['json' => $payload]);
        if (!\in_array($response->getStatusCode(), [200, 201], true)) {
            throw new IntegrationException('MailerLite did not create or update the subscriber.');
        }

        $json = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
        if (empty($json['data']['id'])) {
            throw new IntegrationException('MailerLite did not return a subscriber ID.');
        }

        $this->triggerAfterResponseEvent(self::CATEGORY_SUBSCRIBER, $response);
        $this->logger->info('Subscriber saved to MailerLite.', ['status' => $json['data']['status'] ?? null]);
    }

    private function fetchCollection(Client $client, string $endpoint): array
    {
        $items = [];
        $page = 1;

        do {
            // Build each request locally rather than following credential-bearing links.
            $response = $client->get($this->getEndpoint($endpoint), ['query' => ['limit' => 100, 'page' => $page]]);
            if (200 !== $response->getStatusCode()) {
                throw new IntegrationException('Could not fetch MailerLite '.$endpoint.'.');
            }

            $json = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
            if (!isset($json['data']) || !\is_array($json['data'])) {
                throw new IntegrationException('MailerLite returned an invalid collection.');
            }

            $currentPage = $json['meta']['current_page'] ?? null;
            $lastPage = $json['meta']['last_page'] ?? null;
            if ($page !== $currentPage || !\is_int($lastPage) || $lastPage < $page
                || ($lastPage > $page && !$json['data'])
            ) {
                throw new IntegrationException('MailerLite returned invalid pagination metadata.');
            }

            $items = array_merge($items, $json['data']);
            ++$page;
        } while ($page <= $lastPage);

        return $items;
    }
}
