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
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\MailingListIntegration;

abstract class BaseMailChimp extends MailingListIntegration implements OAuth2ConnectorInterface, MailChimpInterface
{
    use OAuth2Trait;

    public const LOG_CATEGORY = 'Mailchimp';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $dataCenter = '';

    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Boolean(
        label: 'Use double opt-in?',
        order: 3,
    )]
    protected bool $doubleOptIn = false;

    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Boolean(
        label: 'Append Mailchimp Contact Tags on update instead of overwriting?',
        instructions: 'When updating an existing contact in Mailchimp, have new Contact Tags added to existing ones instead of overwriting them.',
        order: 4,
    )]
    protected bool $appendContactTags = false;

    private ?array $existingTags = null;

    public function getAuthorizeUrl(): string
    {
        return 'https://login.mailchimp.com/oauth2/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return 'https://login.mailchimp.com/oauth2/token';
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

    public function setDataCenter(string $dataCenter): self
    {
        $this->dataCenter = $dataCenter;

        return $this;
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
                Freeform::t('Could not detect data center for Mailchimp')
            );
        }

        return "https://{$dataCenter}.api.mailchimp.com/3.0/";
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
    public function fetchLists(Client $client): array
    {
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
                Freeform::t(
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
                        $list->id,
                        $list->name,
                        $list->stats->member_count
                    );
                }
            }
        }

        return $lists;
    }

    protected function fetchInterestGroups(Client $client): array
    {
        static $fetchedInterestGroups;

        if (null === $fetchedInterestGroups) {
            $listId = $this->mailingList->getResourceId();

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

    protected function fetchInterests(Client $client, string $interestGroup): array
    {
        $listId = $this->mailingList->getResourceId();

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

    protected function findInterestIdFromName(Client $client, string $name)
    {
        $interestGroups = $this->fetchInterestGroups($client);

        $interests = [];

        if (\count($interestGroups) > 0) {
            foreach ($interestGroups as $interestGroup) {
                $interests = array_merge($interests, $this->fetchInterests($client, $interestGroup['id']));
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
     * Create tags and add them to a member.
     */
    protected function addTagsForMember(Client $client, string $email, array $tags): void
    {
        $listId = $this->mailingList->getResourceId();

        foreach ($tags as $tag) {
            $tagId = $this->getOrCreateTag($client, $tag);

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
    protected function deleteTagsForMember(Client $client, string $emailHash, array $tagsToDelete): void
    {
        $listId = $this->mailingList->getResourceId();

        foreach ($tagsToDelete as $tagId => $tagName) {
            try {
                $client->delete($this->getEndpoint("lists/{$listId}/segments/{$tagId}/members/{$emailHash}"));
            } catch (RequestException $deleteException) {
                $this->getLogger()->warning("Could not delete Mailchimp tag '{$tagName}' (#{$tagId})");
            }
        }
    }

    protected function fetchTags(Client $client): array
    {
        $listId = $this->mailingList->getResourceId();

        if (null === $this->existingTags) {
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

    protected function getOrCreateTag(Client $client, string $tagName): int|string|null
    {
        $listId = $this->mailingList->getResourceId();

        $existingTags = $this->fetchTags($client);
        $tagNameLowerCase = strtolower($tagName);
        if (\in_array($tagNameLowerCase, $existingTags, true)) {
            return array_search($tagNameLowerCase, $existingTags, true);
        }

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

    protected function manageTags(Client $client, string $email, array $tags): void
    {
        $listId = $this->mailingList->getResourceId();
        $appendContactTags = $this->appendContactTags();
        $emailHash = md5(strtolower($email));

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
            $this->addTagsForMember($client, $email, $tagsToAdd);

            if (!$appendContactTags) {
                $tagsToDelete = array_diff($memberTags, $tags);
                $this->deleteTagsForMember($client, $emailHash, $tagsToDelete);
            }
        } catch (RequestException $e) {
        }
    }

    protected function logErrorAndThrow(RequestException $e)
    {
        $responseBody = (string) $e->getResponse()->getBody();
        $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

        throw new IntegrationException(
            Freeform::t('Could not connect to API endpoint')
        );
    }
}
