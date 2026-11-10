<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\BaseDotdigitalIntegration;
use Solspace\Freeform\Library\Activity\ActivityContext;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Dotdigital',
    type: Type::TYPE_EMAIL_MARKETING,
    version: 'v3',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class DotdigitalV3 extends BaseDotdigitalIntegration
{
    // ==========================================
    //               Contact Data
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Contact Data',
        instructions: 'Select the Freeform fields to be mapped to the applicable Dotdigital, Contact Data fields.',
        order: 6,
        source: 'api/integrations/email-marketing/fields/'.self::CATEGORY_CONTACT_DATA,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $contactDataMapping = null;

    public function push(Form $form, Client $client): void
    {
        if (!$this->mailingList || !$this->emailField) {
            $this->logger->debug('Mailing list or email field not set. Skipping.', ['activityReason' => ActivityContext::INTEGRATION_NOT_CONFIGURED]);

            return;
        }

        $listId = $this->mailingList->getResourceId();
        if (!$listId) {
            $this->logger->debug('Mailing list ID not set. Skipping.', ['activityReason' => ActivityContext::INTEGRATION_NO_LIST]);

            return;
        }

        if ($this->optInField) {
            $optInValue = $form->get($this->optInField->getUid())->getValue();
            if (!$optInValue) {
                $this->logger->debug('Opt-in field used but not chosen. Skipping.', ['activityReason' => ActivityContext::INTEGRATION_NO_OPT_IN]);

                return;
            }
        }

        $email = $form->get($this->emailField->getUid())->getValue();
        if (!$email) {
            $this->logger->debug('Email field empty. Skipping.', ['activityReason' => ActivityContext::INTEGRATION_NO_EMAIL]);

            return;
        }

        $dataFieldsMap = [];
        $contactDataMapping = $this->processMapping($form, $this->contactDataMapping, self::CATEGORY_CONTACT_DATA);
        foreach ($contactDataMapping as $key => $value) {
            if (null === $value || '' === $value) {
                continue;
            }

            $dataFieldsMap[$key] = $value;
        }

        $email = strtolower($email);
        $encodedEmail = rawurlencode($email);

        $contactData = [
            'identifiers' => [
                'email' => $email,
            ],
            'dataFields' => $dataFieldsMap ?: new \stdClass(),
            'lists' => [
                (int) $listId,
            ],
            'channelProperties' => [
                'email' => [
                    'resubscribeOptions' => [
                        'returnContact' => true,
                        'resubscribeWithNoChallenge' => true,
                    ],
                ],
            ],
        ];

        $this->logger->debug('Contact Data', $contactData);

        $response = $client->patch(
            $this->getEndpoint("/contacts/v3/email/{$encodedEmail}?merge-option=overwrite-if-not-empty"),
            ['json' => $contactData],
        );

        $this->logger->info('Contact imported/updated', ['email' => $email, 'activityReason' => ActivityContext::INTEGRATION_SAVED]);
        $this->logger->debug('Contact Mapping', $contactDataMapping);

        $this->triggerAfterResponseEvent(self::CATEGORY_CONTACT_DATA, $response);
    }
}
