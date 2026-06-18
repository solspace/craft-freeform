<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\EmailMarketing\Brevo\Versions;

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
use Solspace\Freeform\Integrations\EmailMarketing\Brevo\BaseBrevoIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Brevo',
    type: Type::TYPE_EMAIL_MARKETING,
    version: 'v3',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class BrevoV3 extends BaseBrevoIntegration
{
    protected const API_VERSION = 'v3';

    // ==========================================
    //             Contact Attributes
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mailingList)')]
    #[Input\Special\Properties\FieldMapping(
        label: 'Contact Attributes',
        instructions: 'Select the Freeform fields to be mapped to the applicable contact attributes',
        order: 6,
        source: 'api/integrations/email-marketing/fields/'.self::CATEGORY_CONTACT_ATTRIBUTES,
        parameterFields: [
            'id' => 'id',
            'values.mailingList' => 'mailingListId',
        ],
    )]
    protected ?FieldMapping $contactAttributesMapping = null;

    public function getApiRootUrl(): string
    {
        return 'https://api.brevo.com/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): void
    {
        if (!$this->mailingList || !$this->emailField) {
            $this->logger->debug('Mailing list or email field not set. Skipping.');

            return;
        }

        $listId = (int) $this->mailingList->getResourceId();
        if (!$listId) {
            $this->logger->debug('Mailing list ID not set. Skipping.');

            return;
        }

        if ($this->optInField) {
            $optInValue = $form->get($this->optInField->getUid())->getValue();
            if (!$optInValue) {
                $this->logger->debug('Opt-in field used but not chosen. Skipping.');

                return;
            }
        }

        $email = $form->get($this->emailField->getUid())->getValue();
        if (!$email) {
            $this->logger->debug('Email field empty. Skipping.');

            return;
        }

        $mapping = $this->normalizeBrevoAttributes($this->processMapping($form, $this->contactAttributesMapping, self::CATEGORY_CONTACT_ATTRIBUTES));

        $response = $client->post(
            $this->getEndpoint('/contacts'),
            [
                'json' => [
                    'email' => $email,
                    'attributes' => $mapping,
                    'listIds' => [$listId],
                    'updateEnabled' => true,
                    'forceMerge' => true,
                    'getId' => true,
                ],
            ],
        );

        $this->triggerAfterResponseEvent(self::CATEGORY_CONTACTS, $response);
    }

    private function normalizeBrevoAttributes(array $mapping): array
    {
        foreach ($mapping as $handle => $value) {
            $mapping[$handle] = match ($handle) {
                'CONTACT_TIMEZONE' => $this->normalizeBrevoTimezone($value),
                'DOUBLE_OPT-IN' => $this->normalizeBrevoDoubleOptIn($value),
                '_DETECTED_LANGUAGE' => $this->normalizeBrevoLanguage($value),
                'SMS', 'LANDLINE_NUMBER', 'WHATSAPP' => $this->normalizeBrevoPhoneNumber($value),
                default => $value,
            };
        }

        return $mapping;
    }

    private function normalizeBrevoDoubleOptIn(mixed $value): mixed
    {
        if (null === $value || '' === $value || false === $value) {
            return '2';
        }

        $value = strtolower(trim((string) $value));

        return match ($value) {
            '1', 'yes', 'true', 'on' => '1',
            default => '2',
        };
    }

    private function normalizeBrevoLanguage(mixed $value): mixed
    {
        if (!\is_string($value) || '' === trim($value)) {
            return $value;
        }

        $value = trim($value);

        // Already a Brevo language code.
        if (preg_match('/^[a-z]{2}$/i', $value)) {
            return strtolower($value);
        }

        return $value;
    }

    private function normalizeBrevoTimezone(mixed $value): mixed
    {
        if (!\is_string($value) || '' === trim($value)) {
            return $value;
        }

        $value = trim($value);

        // Already looks like a Brevo timezone display value.
        if (preg_match('/^\(GMT[+-]\d{2}:\d{2}\)\s+.+$/', $value)) {
            return $value;
        }

        // Freeform display label uses UTC. Brevo expects GMT and two spaces before the city.
        if (preg_match('/^\(UTC([+-]\d{2}:\d{2})\)\s+(.+)$/', $value, $matches)) {
            return \sprintf(
                '(GMT%s) %s',
                $matches[1],
                trim($matches[2])
            );
        }

        // Freeform identifier value, e.g. Europe/Dublin.
        try {
            $timezone = new \DateTimeZone($value);
        } catch (\Exception) {
            return $value;
        }

        $timezoneLabel = $this->getReadableTimezoneName($value);

        return $this->getBrevoTimezoneLabel($timezone, $timezoneLabel);
    }

    private function getReadableTimezoneName(string $timezoneValue): string
    {
        if ('UTC' === $timezoneValue) {
            return 'UTC';
        }

        $parts = explode('/', $timezoneValue);
        $name = end($parts);

        return str_replace('_', ' ', $name);
    }

    private function getBrevoTimezoneLabel(\DateTimeZone $timezone, string $timezoneLabel): string
    {
        $offset = $timezone->getOffset(new \DateTime('now', $timezone));

        $sign = $offset >= 0 ? '+' : '-';
        $offset = abs($offset);

        $hours = floor($offset / 3600);
        $minutes = floor(($offset % 3600) / 60);

        return \sprintf(
            '(GMT%s%02d:%02d) %s',
            $sign,
            $hours,
            $minutes,
            $timezoneLabel
        );
    }

    private function normalizeBrevoPhoneNumber(mixed $value): mixed
    {
        if (!\is_string($value) || '' === trim($value)) {
            return $value;
        }

        $value = trim($value);

        if (str_starts_with($value, '+')) {
            return substr($value, 1);
        }

        return $value;
    }
}
