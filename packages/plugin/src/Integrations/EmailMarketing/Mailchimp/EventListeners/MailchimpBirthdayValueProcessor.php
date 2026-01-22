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

namespace Solspace\Freeform\Integrations\EmailMarketing\Mailchimp\EventListeners;

use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Integrations\EmailMarketing\Mailchimp\MailchimpIntegrationInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use yii\base\Event;

class MailchimpBirthdayValueProcessor extends FeatureBundle
{
    private const BIRTHDAY_FORMAT = 'm/d';

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
        if ($integration::TYPE_BIRTHDAY !== $integrationField->getType()) {
            return;
        }

        $freeformField = $event->getFreeformField();

        $value = $freeformField->getValue();
        if (empty($value)) {
            return;
        }

        if ($freeformField instanceof DatetimeField) {
            $event->setValue($freeformField->getCarbon()->format(self::BIRTHDAY_FORMAT));

            return;
        }

        $event->setValue($this->normalizeToBirthday($value));
    }

    private function normalizeToBirthday(string $value): string
    {
        try {
            $date = new \DateTime($value);

            return $date->format(self::BIRTHDAY_FORMAT);
        } catch (\Exception $exception) {
            // Possible ambiguous or incomplete input formats
            $formats = [
                'd/m',
                'd-m',
                'm/d',
                'm-d',
                'm.d',
                'd.m',
                'm d',
                'd m',
            ];

            foreach ($formats as $format) {
                $date = \DateTime::createFromFormat($format, $value);
                if ($date && $date->format($format) === $value) {
                    return $date->format(self::BIRTHDAY_FORMAT);
                }
            }

            // Invalid or unrecognized format, so just return the original value
            return $value;
        }
    }
}
