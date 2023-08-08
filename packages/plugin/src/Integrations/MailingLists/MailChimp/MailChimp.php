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

namespace Solspace\Freeform\Integrations\MailingLists\MailChimp;

use GuzzleHttp\Client;
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
    name: 'Mailchimp',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class MailChimp extends MailingListIntegration
{
    public const LOG_CATEGORY = 'Mailchimp';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your Mailchimp API key here.',
    )]
    protected string $apiKey = '';

    #[Input\Boolean('Use double opt-in?')]
    protected bool $doubleOptIn = false;

    #[Input\Boolean(
        label: 'Append Mailchimp Contact Tags on update instead of overwriting?',
        instructions: 'When updating an existing contact in Mailchimp, have new Contact Tags added to existing ones instead of overwriting them.',
    )]
    protected bool $appendContactTags = false;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $dataCenter = '';

    private ?array $existingTags = null;

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function isDoubleOptIn(): bool
    {
        return $this->doubleOptIn;
    }

    public function appendContactTags(): bool
    {
        return $this->appendContactTags;
    }

    public function getDataCenter(): string
    {
        return $this->dataCenter;
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
            $response = $client->get($this->getEndpoint('/'));
            $json = json_decode((string) $response->getBody());

            if (isset($json->error) && !empty($json->error)) {
                throw new IntegrationException($json->error);
            }

            return isset($json->account_id) && !empty($json->account_id);
        } catch (RequestException $e) {
            $this->logErrorAndThrow($e);
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
        $isDoubleOptIn = $this->isDoubleOptIn();
        $listId = $mailingList->getId();

        foreach ($emails as $email) {
            $email = strtolower($email);
            $emailHash = md5($email);
            $memberData = [
                'email_address' => $email,
                'status' => $isDoubleOptIn ? 'pending' : 'subscribed',
                'status_if_new' => $isDoubleOptIn ? 'pending' : 'subscribed',
            ];

            $marketingPermissions = $tags = $interests = [];
            foreach ($mappedValues as $key => $value) {
                if (preg_match('/gdpr___(.*)/', $key, $matches)) {
                    $marketingPermissions[] = [
                        'marketing_permission_id' => $matches[1],
                        'enabled' => !empty($value),
                    ];

                    unset($mappedValues[$key]);
                }

                if (str_contains($key, 'tags___tags')) {
                    $tags = explode(',', $value);
                    $tags = array_map('trim', $tags);
                    $tags = array_filter($tags);

                    unset($mappedValues[$key]);
                }

                if (str_contains($key, 'interests___interests')) {
                    $interestsSelection = explode(',', $value);
                    $interestsSelection = array_map('trim', $interestsSelection);
                    $interestsSelection = array_filter($interestsSelection);

                    foreach ($interestsSelection as $interest) {
                        $interestId = $this->findInterestIdFromName($interest, $listId);
                        if ($interestId) {
                            $interests[$interestId] = true;
                        }
                    }

                    unset($mappedValues[$key]);
                }
            }

            if (!empty($mappedValues)) {
                $memberData['merge_fields'] = $mappedValues;
            }

            if (!empty($marketingPermissions)) {
                $memberData['marketing_permissions'] = $marketingPermissions;
            }

            $interests = array_filter($interests);
            if (!empty($interests)) {
                $memberData['interests'] = $interests;
            }

            try {
                $response = $client->put(
                    $this->getEndpoint("lists/{$listId}/members/{$emailHash}"),
                    ['json' => $memberData]
                );

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $exception) {
                $json = json_decode($exception->getResponse()->getBody());
                $is400 = isset($json->status) && 400 === $json->status;
                $isComplianceState = isset($json->title) && 'member in compliance state' === strtolower($json->title);

                if ($is400 && $isComplianceState) {
                    try {
                        $memberData['status'] = 'pending';
                        $response = $client->put(
                            $this->getEndpoint("lists/{$listId}/members/{$emailHash}"),
                            ['json' => $memberData]
                        );

                        $this->getHandler()->onAfterResponse($this, $response);
                    } catch (RequestException $e) {
                        $this->logErrorAndThrow($exception);
                    }
                } else {
                    $this->logErrorAndThrow($exception);
                }
            }

            $this->manageTags($listId, $email, $tags);
        }

        return true;
    }

    /**
     * Perform anything necessary before this integration is saved.
     *
     * @throws IntegrationException
     */
    public function onBeforeSave()
    {
        if (preg_match('/([a-zA-Z]+[\d]+)$/', $this->getApiKey(), $matches)) {
            $dataCenter = $matches[1];
            $this->dataCenter = $dataCenter;
        } else {
            throw new IntegrationException('Could not detect data center for Mailchimp');
        }
    }

    /**
     * Returns the API root url without endpoints specified.
     *
     * @throws IntegrationException
     */
    public function getApiRootUrl(): string
    {
        $dataCenter = $this->getDataCenter();

        if (empty($dataCenter)) {
            throw new IntegrationException(
                $this->getTranslator()->translate('Could not detect data center for Mailchimp')
            );
        }

        return "https://{$dataCenter}.api.mailchimp.com/3.0/";
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client(['auth' => ['mailchimp', $this->getApiKey()]]);
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

        try {
            $response = $client->get(
                $this->getEndpoint('/lists'),
                [
                    'query' => [
                        'fields' => 'lists.id,lists.name,lists.stats.member_count',
                        'count' => 999,
                    ],
                ]
            );
        } catch (RequestException $e) {
            $this->logErrorAndThrow($e);
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

    protected function fetchInterestGroups(string $listId): array
    {
        static $fetchedInterestGroups;

        if (null === $fetchedInterestGroups) {
            $client = $this->generateAuthorizedClient();

            try {
                $response = $client->get(
                    $this->getEndpoint(
                        "/lists/{$listId}/interest-categories?fields=interest-categories.id,interest-categories.name"
                    ),
                    ['query' => ['count' => 999]]
                );
            } catch (RequestException $e) {
                $this->logErrorAndThrow($e);
            }

            $json = json_decode((string) $response->getBody());

            $interestGroups = [];
            if (isset($json->categories)) {
                foreach ($json->categories as $interestGroup) {
                    if (isset($interestGroup->id, $interestGroup->title)) {
                        $interestGroups[] = [
                            'id' => $interestGroup->id,
                            'name' => $interestGroup->title,
                        ];
                    }
                }
            }

            $fetchedInterestGroups = $interestGroups;
        }

        return $fetchedInterestGroups;
    }

    protected function fetchInterests($listId, $interestGroup): array
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get(
                $this->getEndpoint(
                    "/lists/{$listId}/interest-categories/{$interestGroup}/interests?fields=interests.id,interests.name"
                ),
                ['query' => ['count' => 999]]
            );
        } catch (RequestException $e) {
            $this->logErrorAndThrow($e);
        }

        $json = json_decode((string) $response->getBody());

        $interests = [];
        if (isset($json->interests)) {
            foreach ($json->interests as $interest) {
                if (isset($interest->id, $interest->name)) {
                    $interests[] = [
                        'id' => $interest->id,
                        'name' => $interest->name,
                    ];
                }
            }
        }

        return $interests;
    }

    protected function findInterestIdFromName($name, $listId)
    {
        $interestGroups = $this->fetchInterestGroups($listId);

        $interests = [];

        if (\count($interestGroups) > 0) {
            foreach ($interestGroups as $interestGroup) {
                $interests = array_merge($interests, $this->fetchInterests($listId, $interestGroup['id']));
            }
        }

        foreach ($interests as $interest) {
            if (isset($interest['name']) && $interest['name'] === $name) {
                return $interest['id'];
            }
        }

        return null;
    }

    /**
     * Fetch all custom fields for each list.
     *
     * @return FieldObject[]
     *
     * @throws IntegrationException
     */
    protected function fetchFields(string $listId): array
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get(
                $this->getEndpoint("/lists/{$listId}/merge-fields"),
                ['query' => ['count' => 999]]
            );
        } catch (RequestException $e) {
            $this->logErrorAndThrow($e);
        }

        $json = json_decode((string) $response->getBody());

        $fieldList = [];
        if (isset($json->merge_fields)) {
            foreach ($json->merge_fields as $field) {
                $type = match ($field->type) {
                    'text', 'website', 'url', 'dropdown', 'radio', 'date', 'birthday', 'zip' => FieldObject::TYPE_STRING,
                    'number', 'phone' => FieldObject::TYPE_NUMERIC,
                    default => null,
                };

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
        }

        // Fetch marketing permissions
        try {
            $response = $client->get(
                $this->getEndpoint("/lists/{$listId}/members"),
                [
                    'query' => [
                        'count' => 1,
                        'fields' => ['members.id', 'members.marketing_permissions'],
                    ],
                ]
            );

            $json = json_decode((string) $response->getBody());
            $members = $json->members ?? [];

            if (!\count($members)) {
                try {
                    $tempResponse = $client->post(
                        $this->getEndpoint("/lists/{$listId}/members"),
                        [
                            'json' => [
                                'email_address' => rand(10000, 99999).'_temp@test.test',
                                'status' => 'subscribed',
                            ],
                        ]
                    );

                    $tempJson = json_decode((string) $tempResponse->getBody());

                    $tempSubscriberHash = $tempJson->id;
                    $marketingPermissions = $tempJson->marketing_permissions ?? [];

                    $client->delete($this->getEndpoint("/lists/{$listId}/members/{$tempSubscriberHash}"));
                } catch (RequestException $e) {
                    $marketingPermissions = [];
                }
            } else {
                $marketing = reset($members);
                $marketingPermissions = $marketing->marketing_permissions ?? [];
            }

            foreach ($marketingPermissions as $permission) {
                $fieldList[] = new FieldObject(
                    'gdpr___'.$permission->marketing_permission_id,
                    $permission->text.' (GDPR)',
                    FieldObject::TYPE_BOOLEAN,
                    false
                );
            }
        } catch (RequestException $e) {
        }

        $fieldList[] = new FieldObject(
            'tags___tags',
            'Tags (Tags)',
            FieldObject::TYPE_STRING
        );

        $fieldList[] = new FieldObject(
            'interests___interests',
            'Group or Interest (Group or Interest)',
            FieldObject::TYPE_STRING
        );

        return $fieldList;
    }

    private function logErrorAndThrow(RequestException $e)
    {
        $responseBody = (string) $e->getResponse()->getBody();
        $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

        throw new IntegrationException(
            $this->getTranslator()->translate('Could not connect to API endpoint')
        );
    }

    /**
     * Create tags and add them to a member.
     */
    private function addTagsForMember(string $listId, string $email, array $tags)
    {
        $client = $this->generateAuthorizedClient();

        foreach ($tags as $tag) {
            $tagId = $this->getOrCreateTag($listId, $tag);

            try {
                $client->post(
                    $this->getEndpoint("lists/{$listId}/segments/{$tagId}/members"),
                    ['json' => ['email_address' => $email]]
                );
            } catch (RequestException $exception) {
                $this->getLogger()->error("Could not add a Mailchimp tag '{$tag}' to user {$email}");
            }
        }
    }

    /**
     * Delete tags for a member.
     */
    private function deleteTagsForMember(string $listId, string $emailHash, array $tagsToDelete)
    {
        $client = $this->generateAuthorizedClient();

        foreach ($tagsToDelete as $tagId => $tagName) {
            try {
                $client->delete($this->getEndpoint("lists/{$listId}/segments/{$tagId}/members/{$emailHash}"));
            } catch (RequestException $deleteException) {
                $this->getLogger()->warning("Could not delete Mailchimp tag '{$tagName}' (#{$tagId})");
            }
        }
    }

    private function fetchTags(string $listId): array
    {
        if (null === $this->existingTags) {
            $client = $this->generateAuthorizedClient();

            try {
                $response = $client->get(
                    $this->getEndpoint("lists/{$listId}/segments"),
                    ['query' => ['fields' => 'segments.id,segments.name', 'count' => 999]]
                );
                $data = json_decode((string) $response->getBody());

                $tags = [];
                foreach ($data->segments as $tag) {
                    $tags[$tag->id] = strtolower($tag->name);
                }

                $this->existingTags = $tags;
            } catch (RequestException $e) {
                $this->getLogger()->error('Could not fetch Mailchimp tags');

                $this->existingTags = [];
            }
        }

        return $this->existingTags;
    }

    private function getOrCreateTag(string $listId, string $tagName): int|string|null
    {
        $existingTags = $this->fetchTags($listId);
        $tagNameLowerCase = strtolower($tagName);
        if (\in_array($tagNameLowerCase, $existingTags, true)) {
            return array_search($tagNameLowerCase, $existingTags, true);
        }

        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->post(
                $this->getEndpoint("lists/{$listId}/segments"),
                ['json' => ['name' => $tagName, 'static_segment' => []]]
            );

            $data = json_decode((string) $response->getBody());

            return $data->id;
        } catch (RequestException $e) {
            $this->getLogger()->warning("Could not create a Mailchimp tag '{$tagName}'");

            return null;
        }
    }

    private function manageTags(string $listId, string $email, array $tags): void
    {
        $appendContactTags = $this->appendContactTags();
        $emailHash = md5(strtolower($email));
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get(
                $this->getEndpoint("lists/{$listId}/members/{$emailHash}/tags"),
                ['query' => ['count' => 999]]
            );

            $data = json_decode((string) $response->getBody());

            $memberTags = [];
            foreach ($data->tags as $tag) {
                $memberTags[$tag->id] = $tag->name;
            }

            $tagsToAdd = array_diff($tags, $memberTags);
            $this->addTagsForMember($listId, $email, $tagsToAdd);

            if (!$appendContactTags) {
                $tagsToDelete = array_diff($memberTags, $tags);
                $this->deleteTagsForMember($listId, $emailHash, $tagsToDelete);
            }
        } catch (RequestException $e) {
        }
    }
}
