<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\EmailMarketing\Mailchimp\EventListeners;

use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Integrations\EmailMarketing\Mailchimp\MailchimpIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\base\Event;

class MailchimpDateValueProcessor extends FeatureBundle
{
    private const DATE_FORMAT = 'm/d/Y';

    public function __construct()
    {
        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processValue']
        );
    }

    public function processValue(ProcessValueEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof MailchimpIntegrationInterface) {
            return;
        }

        $integrationField = $event->getIntegrationField();
        if (FieldObject::TYPE_DATE !== $integrationField->getType()) {
            return;
        }

        $value = $event->getValue();
        if (empty($value)) {
            return;
        }

        // Mailchimp requires MM/DD/YYYY for a valid date input even though it shows other formats when creating date fields
        $event->setValue($this->normalizeToMMDDYYYY($value));
    }

    private function normalizeToMMDDYYYY(string $value): string
    {
        $possibleFormats = [
            'Y.m.d',
            'Y/m/d',
            'Y-m-d',
            'd.m.Y',
            'd/m/Y',
            'd-m-Y',
            'm.d.Y',
            'm/d/Y',
            'm-d-Y',
        ];

        foreach ($possibleFormats as $format) {
            $date = \DateTime::createFromFormat($format, $value);

            // Check for valid date and matching format
            if ($date && $date->format($format) === $value) {
                // already correct format, return as-is
                if (self::DATE_FORMAT === $format) {
                    return $value;
                }

                return $date->format(self::DATE_FORMAT);
            }
        }

        // Invalid or unrecognized format, so just return the original value
        return $value;
    }
}
