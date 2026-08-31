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
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\base\Event;

class MailchimpDateValueProcessor extends FeatureBundle
{
    private const DATE_FORMAT = 'm/d/Y';

    private const YEAR_FIRST_INPUT_FORMATS = [
        'Y/m/d',
        'Y/n/j',
        'Y-m-d',
        'Y-n-j',
        'Y.m.d',
        'Y.n.j',
        'Y m d',
        'Y n j',
    ];

    private const MONTH_FIRST_INPUT_FORMATS = [
        'm/d/Y',
        'n/j/Y',
        'm-d-Y',
        'n-j-Y',
        'm.d.Y',
        'n.j.Y',
        'm d Y',
        'n j Y',
    ];

    private const DAY_FIRST_INPUT_FORMATS = [
        'd/m/Y',
        'j/n/Y',
        'd-m-Y',
        'j-n-Y',
        'd.m.Y',
        'j.n.Y',
        'd m Y',
        'j n Y',
    ];

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

        $freeformField = $event->getFreeformField();

        $value = $freeformField->getValue();
        if (empty($value)) {
            return;
        }

        $inputDateFormat = $this->getInputDateFormat($integrationField);
        $outputDateFormat = $this->getOutputDateFormat($inputDateFormat);
        $monthFirst = $this->isMonthFirst($inputDateFormat);

        if ($freeformField instanceof DatetimeField) {
            $event->setValue($freeformField->getCarbon()->format($outputDateFormat));

            return;
        }

        $event->setValue($this->normalizeToConfiguredOuputFormat($value, $monthFirst, $outputDateFormat));
    }

    /**
     * Mailchimp stores the configuerd date format (MM/DD/YYYY or DD/MM/YYYY) for a date field in its own field options.
     */
    private function getInputDateFormat(FieldObject $integrationField): ?string
    {
        foreach ($integrationField->getOptions() as $option) {
            if ('date_format' === $option->key) {
                return $option->label;
            }
        }

        return null;
    }

    private function getOutputDateFormat(?string $dateFormat): string
    {
        if (null === $dateFormat) {
            return self::DATE_FORMAT;
        }

        $normalized = strtoupper($dateFormat);
        $positions = [
            'Y' => strpos($normalized, 'YYYY'),
            'm' => strpos($normalized, 'MM'),
            'd' => strpos($normalized, 'DD'),
        ];

        // Fall back to the default format when any part of the input date format is missing so the output stays a valid Mailchimp date.
        if (\in_array(false, $positions, true)) {
            return self::DATE_FORMAT;
        }

        asort($positions);

        return implode('/', array_keys($positions));
    }

    private function isMonthFirst(?string $dateFormat): bool
    {
        if (null === $dateFormat) {
            return false;
        }

        $normalized = strtoupper($dateFormat);
        $monthPosition = strpos($normalized, 'MM');
        $dayPosition = strpos($normalized, 'DD');

        if (false === $monthPosition || false === $dayPosition) {
            return false;
        }

        return $monthPosition < $dayPosition;
    }

    private function normalizeToConfiguredOuputFormat(string $value, bool $monthFirst, string $dateFormat): string
    {
        $formats = array_merge(
            self::YEAR_FIRST_INPUT_FORMATS,
            $monthFirst
                ? array_merge(self::MONTH_FIRST_INPUT_FORMATS, self::DAY_FIRST_INPUT_FORMATS)
                : array_merge(self::DAY_FIRST_INPUT_FORMATS, self::MONTH_FIRST_INPUT_FORMATS),
        );

        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $value);

            // Check for valid date and matching format
            if ($date && $date->format($format) === $value) {
                return $date->format($dateFormat);
            }
        }

        // Invalid or unrecognized format, so just return the original value
        return $value;
    }
}
