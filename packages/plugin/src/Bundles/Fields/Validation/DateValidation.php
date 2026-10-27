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

        $value = $field->getValue();
        if (!$value) {
            return;
        }

        $format = $this->parseFormat($field->getFormat());
        $value = $this->parseValue($value);

        if ($field->isUseNativeTypes()) {
            $format = $field->getNativeFormat();
        }

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

        $value = $field->getValue();
        if (!$value) {
            return;
        }

        $minDate = $field->getMinDateBoundary();
        if (!$minDate) {
            return;
        }

        try {
            $format = $field->isUseNativeTypes() ? $field->getNativeFormat() : $field->getFormat();
            $date = Carbon::createFromFormat('!'.$format, $value);
            if (!$field->isShowDate()) {
                $date->setDateFrom(Carbon::now());
            }

            if ($date->lt($minDate)) {
                $field->addError(
                    Freeform::t(
                        'Date "{date}" must be on or after "{minDate}"',
                        [
                            'date' => $date->format($field->getFormat()),
                            'minDate' => $field->getMinDateInputValue($field->getDateBoundaryFormat($field->getMinDate())),
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

        $value = $field->getValue();
        if (!$value) {
            return;
        }

        $maxDate = $field->getMaxDateBoundary();
        if (!$maxDate) {
            return;
        }

        try {
            $format = $field->isUseNativeTypes() ? $field->getNativeFormat() : $field->getFormat();
            $date = Carbon::createFromFormat('!'.$format, $value);
            if (!$field->isShowDate()) {
                $date->setDateFrom(Carbon::now());
            }

            if ($date->gt($maxDate)) {
                $field->addError(
                    Freeform::t(
                        'Date "{date}" must be on or before "{maxDate}"',
                        [
                            'date' => $value,
                            'maxDate' => $maxDate->format($field->getDateBoundaryFormat($field->getMaxDate())),
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
