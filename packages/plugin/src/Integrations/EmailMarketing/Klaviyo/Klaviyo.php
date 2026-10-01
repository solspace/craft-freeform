<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Klaviyo;

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
    name: 'Klaviyo',
    type: Type::TYPE_EMAIL_MARKETING,
    version: '2026-07-15',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Klaviyo extends EmailMarketingIntegration implements KlaviyoIntegrationInterface
{
    public const CATEGORY_PROFILE = 'profile';
    public const CATEGORY_CUSTOM = 'custom';
    public const CATEGORY_SUBSCRIPTIONS = 'subscriptions';

    protected const LOG_CATEGORY = 'Klaviyo';

    private const PROFILE_FIELDS = [
        'first_name' => 'First Name',
        'last_name' => 'Last Name',
        'phone_number' => 'Phone Number (E.164 format)',
        'organization' => 'Organization',
        'title' => 'Job Title',
        'image' => 'Profile Image URL',
        'locale' => 'Locale',
        'location.address1' => 'Address - Street Address',
        'location.address2' => 'Address - Apartment or Suite',
        'location.city' => 'Address - City',
        'location.region' => 'Address - State or Province',
        'location.zip' => 'Address - Postal Code',
        'location.country' => 'Address - Country',
        'location.latitude' => 'Address - Latitude',
        'location.longitude' => 'Address - Longitude',
        'location.timezone' => 'Address - Timezone',
        'location.ip' => 'IP Address',
    ];

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Required]
    #[Input\Text(
        label: 'Private API Key',
        instructions: 'Enter a Klaviyo private API key with Lists read/write, Profiles write, and Subscriptions write access.',
        order: 1,
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\TextArea(
        label: 'Custom Profile Properties',
        instructions: 'Enter the exact name of each custom Klaviyo profile property you want to map, one per line. Save and refresh the fields in the form builder after changing this list.',
        order: 2,
        rows: 5,
    )]
    protected string $customProperties = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Profile Fields',
        instructions: 'Select the Freeform fields to map to Klaviyo profile fields.',
        order: 5,
        source: 'api/integrations/email-marketing/fields/'.self::CATEGORY_PROFILE,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $profileMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Custom Profile Properties',
        instructions: 'Map the custom property names configured in the integration settings. Values are sent as text.',
        order: 6,
        source: 'api/integrations/email-marketing/fields/'.self::CATEGORY_CUSTOM,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $customMapping = null;

    public function getApiKey(): string
    {
        return (string) $this->getProcessedValue($this->apiKey);
    }

    public function getApiRevision(): string
    {
        return '2026-07-15';
    }

    public function getApiRootUrl(): string
    {
        return 'https://a.klaviyo.com/api';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/lists/'), ['query' => ['page[size]' => 1]]);

        return 200 === $response->getStatusCode();
    }

    public function fetchLists(Client $client): array
    {
        $lists = [];
        $url = $this->getEndpoint('/lists/');
        $visited = [];

        while ($url) {
            $parts = parse_url($url);
            if ('https' !== ($parts['scheme'] ?? null)
                || 'a.klaviyo.com' !== ($parts['host'] ?? null)
                || '/api/lists' !== rtrim($parts['path'] ?? '', '/')
                || isset($parts['user'])
                || isset($parts['pass'])
                || isset($parts['port'])
                || isset($visited[$url])
            ) {
                throw new IntegrationException('Klaviyo returned an invalid list pagination URL.');
            }

            $visited[$url] = true;
            $response = $client->get($url);
            if (200 !== $response->getStatusCode()) {
                throw new IntegrationException('Could not fetch Klaviyo lists.');
            }

            $json = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
            if (!isset($json['data']) || !\is_array($json['data'])) {
                throw new IntegrationException('Could not fetch Klaviyo lists.');
            }

            foreach ($json['data'] as $list) {
                if (isset($list['id'], $list['attributes']['name'])) {
                    $lists[] = new ListObject($list['id'], $list['attributes']['name']);
                }
            }

            $url = $json['links']['next'] ?? null;
            if (null !== $url && !\is_string($url)) {
                throw new IntegrationException('Klaviyo returned an invalid list pagination URL.');
            }
        }

        return $lists;
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        return array_values($this->getProcessableFields($category));
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

        $email = trim($email);
        $attributes = ['email' => $email];
        $mapping = $this->processMapping($form, $this->profileMapping, self::CATEGORY_PROFILE);
        foreach ($mapping as $handle => $value) {
            if (null === $value || '' === $value) {
                continue;
            }

            if (str_starts_with($handle, 'location.')) {
                $attributes['location'][substr($handle, 9)] = $value;
            } else {
                $attributes[$handle] = $value;
            }
        }

        $properties = $this->processMapping($form, $this->customMapping, self::CATEGORY_CUSTOM);
        $properties = array_filter($properties, static fn ($value) => null !== $value && '' !== $value);
        if ($properties) {
            // Property names are literal keys, including names containing dots or numeric names.
            $attributes['properties'] = (object) $properties;
        }

        $response = $client->post($this->getEndpoint('/profile-import/'), [
            'json' => [
                'data' => [
                    'type' => 'profile',
                    'attributes' => $attributes,
                ],
            ],
        ]);

        if (!\in_array($response->getStatusCode(), [200, 201], true)) {
            throw new IntegrationException('Klaviyo did not create or update the profile.');
        }

        $json = json_decode((string) $response->getBody(), true, 512, \JSON_THROW_ON_ERROR);
        $profileId = $json['data']['id'] ?? null;
        if (!\is_string($profileId) || '' === $profileId) {
            throw new IntegrationException('Klaviyo did not return a profile ID.');
        }

        $this->triggerAfterResponseEvent(self::CATEGORY_PROFILE, $response);

        // A list relationship on the subscription request preserves the list's opt-in process.
        $response = $client->post($this->getEndpoint('/profile-subscription-bulk-create-jobs/'), [
            'json' => [
                'data' => [
                    'type' => 'profile-subscription-bulk-create-job',
                    'attributes' => [
                        'custom_source' => 'Freeform',
                        'profiles' => [
                            'data' => [
                                [
                                    'type' => 'profile',
                                    'id' => $profileId,
                                    'attributes' => [
                                        'email' => $email,
                                        'subscriptions' => [
                                            'email' => [
                                                'marketing' => ['consent' => 'SUBSCRIBED'],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'relationships' => [
                        'list' => [
                            'data' => [
                                'type' => 'list',
                                'id' => $this->mailingList->getResourceId(),
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        if (202 !== $response->getStatusCode()) {
            throw new IntegrationException('Klaviyo did not accept the email subscription request.');
        }

        $this->triggerAfterResponseEvent(self::CATEGORY_SUBSCRIPTIONS, $response);
        $this->logger->info('Email subscription request accepted by Klaviyo.');
    }

    protected function getProcessableFields(string $category): array
    {
        $definitions = [];
        if (self::CATEGORY_PROFILE === $category) {
            $definitions = self::PROFILE_FIELDS;
        } elseif (self::CATEGORY_CUSTOM === $category) {
            foreach (preg_split('/\R/', $this->customProperties) as $name) {
                $name = trim($name);
                if ('' !== $name) {
                    $definitions[$name] = $name;
                }
            }
        }

        $fields = [];
        foreach ($definitions as $handle => $label) {
            $fields[$handle] = new FieldObject((string) $handle, $label, FieldObject::TYPE_STRING, $category);
        }

        return $fields;
    }
}
