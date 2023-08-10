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

namespace Solspace\Freeform\Integrations\MailingLists\MailChimp\Versions;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\MailingLists\MailChimp\BaseMailChimp;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\MailingLists\DataObjects\ListObject;
use yii\base\Event;

#[Type(
    name: 'Mailchimp (v3)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.png',
)]
class MailChimpV3 extends BaseMailChimp
{
    protected const CATEGORY_MEMBERS = 'members';
    protected const CATEGORY_GDPR = 'gdpr';
    protected const CATEGORY_TAGS = 'tags';
    protected const CATEGORY_GROUPS = 'groups';

    // ==========================================
    //                   Members
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Member Fields',
        instructions: 'Select the Freeform fields to be mapped to the applicable MailChimp Member fields',
        order: 5,
        source: 'api/integrations/mailing-lists/fields/'.self::CATEGORY_MEMBERS,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $memberMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'GDPR',
        instructions: 'Select the Freeform fields to be mapped to the applicable MailChimp GDPR fields',
        order: 6,
        source: 'api/integrations/mailing-lists/fields/'.self::CATEGORY_GDPR,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $gdprMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Tags',
        instructions: 'Select the Freeform fields to be mapped to the applicable MailChimp Tags',
        order: 7,
        source: 'api/integrations/mailing-lists/fields/'.self::CATEGORY_TAGS,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $tagsMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Groups',
        instructions: 'Select the Freeform fields to be mapped to the applicable MailChimp Groups',
        order: 8,
        source: 'api/integrations/mailing-lists/fields/'.self::CATEGORY_GROUPS,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $groupsMapping = null;

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
    public function push(Form $form, Client $client): void
    {
        if (!$this->mailingList || !$this->emailField) {
            return;
        }

        if ($this->optInField) {
            $optInValue = $form->get($this->optInField->getUid())->getValue();
            if (!$optInValue) {
                return;
            }
        }

        $isDoubleOptIn = $this->isDoubleOptIn();
        $listId = $this->mailingList->getResourceId();

        $email = $form->get($this->emailField->getUid())->getValue();
        if (!$email) {
            return;
        }

        $email = strtolower($email);
        $emailHash = md5($email);

        $memberData = [
            'email_address' => $email,
            'status' => $isDoubleOptIn ? 'pending' : 'subscribed',
            'status_if_new' => $isDoubleOptIn ? 'pending' : 'subscribed',
        ];

        $mappedValues = $this->processMapping($form, $this->memberMapping, self::CATEGORY_MEMBERS);

        $gdprData = $this->processMapping($form, $this->gdprMapping, self::CATEGORY_GDPR);
        $marketingPermissions = [];
        foreach ($gdprData as $key => $value) {
            $marketingPermissions[] = [
                'marketing_permission_id' => $key,
                'enabled' => !empty($value),
            ];
        }

        $tagData = $this->processMapping($form, $this->tagsMapping, self::CATEGORY_TAGS);
        $tags = reset($tagData);
        if ($tags) {
            if (\is_string($tags)) {
                $tags = explode(',', $tags);
            }

            $tags = array_map('trim', $tags);
            $tags = array_filter($tags);
        } else {
            $tags = [];
        }

        $groupData = $this->processMapping($form, $this->groupsMapping, self::CATEGORY_GROUPS);
        $groups = reset($groupData);
        $interests = [];
        if ($groups) {
            if (\is_string($groups)) {
                $groups = explode(',', $groups);
            }

            $groups = array_map('trim', $groups);
            $groups = array_filter($groups);

            foreach ($groups as $interest) {
                $interestId = $this->findInterestIdFromName($client, $interest);
                if ($interestId) {
                    $interests[$interestId] = true;
                }
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

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_MEMBERS, $response)
            );
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

                    Event::trigger(
                        $this,
                        self::EVENT_AFTER_RESPONSE,
                        new IntegrationResponseEvent($this, self::CATEGORY_MEMBERS, $response)
                    );
                } catch (RequestException $e) {
                    $this->logErrorAndThrow($exception);
                }
            } else {
                $this->logErrorAndThrow($exception);
            }
        }

        $this->manageTags($client, $email, $tags);
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

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        return match ($category) {
            self::CATEGORY_MEMBERS => $this->fetchMemberFields($list, $client),
            self::CATEGORY_GDPR => $this->fetchGDPRFields($list, $client),
            self::CATEGORY_TAGS => $this->fetchTagFields(),
            self::CATEGORY_GROUPS => $this->fetchGroupFields(),
        };
    }

    private function fetchMemberFields(ListObject $list, Client $client): array
    {
        try {
            $response = $client->get(
                $this->getEndpoint("/lists/{$list->getResourceId()}/merge-fields"),
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

        return $fieldList;
    }

    private function fetchGDPRFields(ListObject $list, Client $client): array
    {
        $fieldList = [];

        try {
            $response = $client->get(
                $this->getEndpoint("/lists/{$list->getResourceId()}/members"),
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
                        $this->getEndpoint("/lists/{$list->getResourceId()}/members"),
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

                    $client->delete($this->getEndpoint("/lists/{$list->getResourceId()}/members/{$tempSubscriberHash}"));
                } catch (RequestException $e) {
                    $marketingPermissions = [];
                }
            } else {
                $marketing = reset($members);
                $marketingPermissions = $marketing->marketing_permissions ?? [];
            }

            foreach ($marketingPermissions as $permission) {
                $fieldList[] = new FieldObject(
                    $permission->marketing_permission_id,
                    $permission->text,
                    FieldObject::TYPE_BOOLEAN,
                    self::CATEGORY_GDPR,
                    false
                );
            }
        } catch (RequestException $e) {
        }

        return $fieldList;
    }

    private function fetchTagFields(): array
    {
        return [
            new FieldObject(
                'tags',
                'Tags',
                FieldObject::TYPE_STRING,
                self::CATEGORY_TAGS,
            ),
        ];
    }

    private function fetchGroupFields(): array
    {
        return [
            new FieldObject(
                'interests',
                'Group or Interest',
                FieldObject::TYPE_STRING,
                self::CATEGORY_GROUPS,
            ),
        ];
    }
}
