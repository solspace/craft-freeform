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
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Events\Integrations\IntegrationResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\MailingLists\MailChimp\BaseMailChimpIntegration;
use yii\base\Event;

#[Type(
    name: 'Mailchimp (v3)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.png',
)]
class MailChimpV3 extends BaseMailChimpIntegration
{
    protected const API_VERSION = '3.0';

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

    public function getAuthorizeUrl(): string
    {
        return 'https://login.mailchimp.com/oauth2/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return 'https://login.mailchimp.com/oauth2/token';
    }

    public function getApiRootUrl(): string
    {
        $url = 'https://us6.api.mailchimp.com';

        $dataCenter = $this->getDataCenter();
        if ($dataCenter) {
            $url = 'https://'.$dataCenter.'.api.mailchimp.com';
        }

        $url = rtrim($url, '/');

        return $url.'/'.self::API_VERSION;
    }

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
                $this->getEndpoint('/lists/'.$listId.'/members/'.$emailHash),
                ['json' => $memberData],
            );

            Event::trigger(
                $this,
                self::EVENT_AFTER_RESPONSE,
                new IntegrationResponseEvent($this, self::CATEGORY_MEMBERS, $response)
            );
        } catch (\Exception $exception) {
            $json = json_decode($exception->getResponse()->getBody());

            $is400 = isset($json->status) && 400 === $json->status;

            $isComplianceState = isset($json->title) && 'member in compliance state' === strtolower($json->title);

            if ($is400 && $isComplianceState) {
                try {
                    $memberData['status'] = 'pending';

                    $response = $client->put(
                        $this->getEndpoint('/lists/'.$listId.'/members/'.$emailHash),
                        ['json' => $memberData],
                    );

                    Event::trigger(
                        $this,
                        self::EVENT_AFTER_RESPONSE,
                        new IntegrationResponseEvent($this, self::CATEGORY_MEMBERS, $response)
                    );
                } catch (\Exception $exception) {
                    $this->processException($exception, self::LOG_CATEGORY);
                }
            } else {
                $this->processException($exception, self::LOG_CATEGORY);
            }
        }

        $this->manageTags($client, $listId, $email, $tags);
    }
}
