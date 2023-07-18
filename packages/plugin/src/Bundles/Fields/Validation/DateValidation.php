<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Carbon\Carbon;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class DateValidation extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateFormat']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateMinDate']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateMaxDate']
        );
    }

    public function validateFormat(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof DatetimeField) {
            return;
        }

        $format = $this->parseFormat($field->getFormat());
        $value = $this->parseValue($field->getValue());

        $date = \DateTime::createFromFormat($format, $value);
        if (!$date || $date->format($format) !== $value) {
            $field->addError(
                Freeform::t(
                    '"{value}" does not conform to "{format}" format.',
                    [
                        'value' => $value,
                        'format' => $field->getHumanReadableFormat(),
                    ]
                )
            );
        }
    }

    public function validateMinDate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof DatetimeField) {
            return;
        }

        $generatedMinDate = $field->getGeneratedMinDate();
        if (!$generatedMinDate) {
            return;
        }

        $minDate = new Carbon($generatedMinDate);
        $minDate->setTime(0, 0, 0);

        try {
            $date = Carbon::createFromFormat($field->getFormat(), $field->getValue());

            if ($date->lt($minDate)) {
                $field->addError(
                    Freeform::t(
                        'Date "{date}" must be after "{minDate}"',
                        [
                            'date' => $field->getValue(),
                            'minDate' => $field->getGeneratedMinDate($field->getDateFormat()),
                        ]
                    )
                );
            }
        } catch (\InvalidArgumentException $e) {
        }
    }

    public function validateMaxDate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof DatetimeField) {
            return;
        }

        $generatedMaxDate = $field->getGeneratedMaxDate();
        if (!$generatedMaxDate) {
            return;
        }

        $maxDate = new Carbon($generatedMaxDate);
        $maxDate->setTime(23, 59, 59);

        try {
            $date = Carbon::createFromFormat($field->getFormat(), $field->getValue());

            if ($date->gt($maxDate)) {
                $field->addError(
                    Freeform::t(
                        'Date "{date}" must be before "{maxDate}"',
                        [
                            'date' => $field->getValue(),
                            'maxDate' => $field->getGeneratedMaxDate($field->getDateFormat()),
                        ]
                    )
                );
            }
        } catch (\InvalidArgumentException $e) {
        }
    }

    /**
     * Forces lowercase AM/PM in the format.
     */
    private function parseFormat(string $format): string
    {
        return preg_replace('/\s?A/i', 'a', $format);
    }

    /**
     * Makes any combination of AM/PM into a lowercase "am/pm" equivalent.
     */
    private function parseValue(string $value): string
    {
        if (preg_match('/(\d)\s?([AaPp])\.?([Mm])?\.?\s*/', $value, $matches)) {
            $value = preg_replace(
                '/(\d)\s?([AaPp])\.?([Mm])?\.?\s*/',
                $matches[1].strtolower($matches[2]).'m',
                $value
            );
        }

        return $value;
    }
}
