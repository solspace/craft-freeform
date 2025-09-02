<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;

class DateProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\Date' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return DatetimeField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        // Map Formie Date field properties to Freeform DatetimeField
        $settings = $formField->getSettings();

        // Use Formie's built-in methods to determine if it's date, time, or both
        if ($formField->getIsDateTime()) {
            $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_BOTH;
        } elseif ($formField->getIsDate()) {
            $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_DATE;
        } elseif ($formField->getIsTime()) {
            $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_TIME;
        } else {
            // Fallback: check if both dateFormat and timeFormat exist
            $hasDate = !empty($formField->dateFormat);
            $hasTime = !empty($formField->timeFormat);

            if ($hasDate && $hasTime) {
                $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_BOTH;
            } elseif ($hasDate) {
                $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_DATE;
            } elseif ($hasTime) {
                $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_TIME;
            } else {
                $metadata['dateTimeType'] = DatetimeField::DATETIME_TYPE_BOTH;
            }
        }

        // Map date format to date order
        if ($formField->getIsDate() || $formField->getIsDateTime()) {
            // Check which date subfields are enabled to determine order
            $hasYear = $formField->getFieldByHandle('year')?->enabled ?? false;
            $hasMonth = $formField->getFieldByHandle('month')?->enabled ?? false;
            $hasDay = $formField->getFieldByHandle('day')?->enabled ?? false;

            if ($hasYear && $hasMonth && $hasDay) {
                // Determine order based on enabled subfields
                if ($hasYear && $hasMonth && $hasDay) {
                    $metadata['dateOrder'] = 'ymd'; // Default to year-month-day
                }
            }

            // Map date separator based on dateFormat
            $dateFormat = $formField->dateFormat ?? 'Y-m-d';
            if (str_contains($dateFormat, '-')) {
                $metadata['dateSeparator'] = '-';
            } elseif (str_contains($dateFormat, '/')) {
                $metadata['dateSeparator'] = '/';
            } elseif (str_contains($dateFormat, '.')) {
                $metadata['dateSeparator'] = '.';
            } else {
                $metadata['dateSeparator'] = ' ';
            }
        }

        // Map time format to 24-hour setting
        if ($formField->getIsTime() || $formField->getIsDateTime()) {
            // Check which time subfields are enabled
            $hasHour = $formField->getFieldByHandle('hour')?->enabled ?? false;
            $hasMinute = $formField->getFieldByHandle('minute')?->enabled ?? false;
            $hasSecond = $formField->getFieldByHandle('second')?->enabled ?? false;
            $hasAmPm = $formField->getFieldByHandle('ampm')?->enabled ?? false;

            if ($hasHour && $hasMinute) {
                // Determine 24-hour vs 12-hour based on AM/PM subfield
                $metadata['clock24h'] = !$hasAmPm;

                // Set clock separator
                $metadata['clockSeparator'] = ':';
            }
        }

        // Map min/max dates
        if ($formField->minDate) {
            $metadata['minDate'] = $formField->minDate instanceof \DateTime
                ? $formField->minDate->format('Y-m-d H:i:s')
                : $formField->minDate;
        }

        if ($formField->maxDate) {
            $metadata['maxDate'] = $formField->maxDate instanceof \DateTime
                ? $formField->maxDate->format('Y-m-d H:i:s')
                : $formField->maxDate;
        }

        // Map default value
        if ($formField->defaultValue) {
            if ('today' === $formField->defaultOption) {
                $metadata['initialValue'] = 'today';
            } elseif ($formField->defaultValue instanceof \DateTime) {
                $metadata['initialValue'] = $formField->defaultValue->format('Y-m-d H:i:s');
            } else {
                $metadata['initialValue'] = $formField->defaultValue;
            }
        }

        // Map display type
        if ('datePicker' === $formField->displayType) {
            $metadata['useDatepicker'] = true;
            $metadata['useNativeTypes'] = false;
        } else {
            $metadata['useDatepicker'] = false;
            $metadata['useNativeTypes'] = true;
        }

        // Map additional properties
        if ($formField->getIsDate() || $formField->getIsDateTime()) {
            $metadata['date4DigitYear'] = true; // Formie always uses 4-digit years
            $metadata['dateLeadingZero'] = true; // Formie uses leading zeros
        }

        // Map placeholder generation
        $metadata['generatePlaceholder'] = true;

        return $metadata;
    }
}
