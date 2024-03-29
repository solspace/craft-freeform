<?php

namespace Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\EmailMarketing\Dotdigital\BaseDotdigitalIntegration;

#[Type(
    name: 'Dotdigital',
    type: Type::TYPE_EMAIL_MARKETING,
    version: 'v2',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class DotdigitalV2 extends BaseDotdigitalIntegration
{
    protected const API_VERSION = 'v2';

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

    public function getApiRootUrl(): string
    {
        $url = $this->getApiUrl();

        $url = rtrim($url, '/');

        return $url.'/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): void
    {
        if (!$this->mailingList || !$this->emailField) {
            return;
        }

        $listId = $this->mailingList->getResourceId();
        if (!$listId) {
            return;
        }

        if ($this->optInField) {
            $optInValue = $form->get($this->optInField->getUid())->getValue();
            if (!$optInValue) {
                return;
            }
        }

        $email = $form->get($this->emailField->getUid())->getValue();
        if (!$email) {
            return;
        }

        $email = strtolower($email);

        $contactData = [];
        $contactData['email'] = $email;
        $contactData['optInType'] = $this->getOptInType();
        $contactData['emailType'] = $this->getEmailType();
        $contactData['dataFields'] = [];

        $contactDataMapping = $this->processMapping($form, $this->contactDataMapping, self::CATEGORY_CONTACT_DATA);
        foreach ($contactDataMapping as $key => $value) {
            $contactData['dataFields'][] = [
                'key' => $key,
                'value' => $value,
            ];
        }

        try {
            $response = $client->post(
                $this->getEndpoint('/address-books/'.$listId.'/contacts'),
                ['json' => $contactData],
            );

            $this->triggerAfterResponseEvent(self::CATEGORY_CONTACT_DATA, $response);
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }
}
