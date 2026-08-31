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

class MailchimpBirthdayValueProcessor extends FeatureBundle
{
    private const MONTH_FIRST_FORMAT = 'm/d';

    private const DAY_FIRST_FORMAT = 'd/m';

    private const MONTH_FIRST_INPUT_FORMATS = [
        'm/d',
        'n/j',
        'm-d',
        'n-j',
        'm.d',
        'n.j',
        'm d',
        'n j',
    ];

    private const DAY_FIRST_INPUT_FORMATS = [
        'd/m',
        'j/n',
        'd-m',
        'j-n',
        'd.m',
        'j.n',
        'd m',
        'j n',
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
        if ($integration::TYPE_BIRTHDAY !== $integrationField->getType()) {
            return;
        }

        $freeformField = $event->getFreeformField();

        $value = $freeformField->getValue();
        if (empty($value)) {
            return;
        }

        $inputDateFormat = $this->getInputDateFormat($integrationField);
        $monthFirst = $this->isMonthFirst($inputDateFormat);
        $outputDateFormat = $monthFirst ? self::MONTH_FIRST_FORMAT : self::DAY_FIRST_FORMAT;

        if ($freeformField instanceof DatetimeField) {
            $event->setValue($freeformField->getCarbon()->format($outputDateFormat));

            return;
        }

        $event->setValue($this->normalizeToBirthday($value, $monthFirst, $outputDateFormat));
    }

    /**
     * Mailchimp stores the configuerd date format (MM/DD or DD/MM) for a birthday field in its own field options.
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

    private function isMonthFirst(?string $dateFormat): bool
    {
        if (null === $dateFormat) {
            return true;
        }

        return !str_starts_with(strtoupper(trim($dateFormat)), 'DD');
    }

    private function normalizeToBirthday(string $value, bool $monthFirst, string $dateFormat): string
    {
        $formats = $monthFirst
            ? array_merge(self::MONTH_FIRST_INPUT_FORMATS, self::DAY_FIRST_INPUT_FORMATS)
            : array_merge(self::DAY_FIRST_INPUT_FORMATS, self::MONTH_FIRST_INPUT_FORMATS);

        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $value);
            if ($date && $date->format($format) === $value) {
                return $date->format($dateFormat);
            }
        }

        // Invalid or unrecognized format, so just return the original value
        return $value;
    }
}
