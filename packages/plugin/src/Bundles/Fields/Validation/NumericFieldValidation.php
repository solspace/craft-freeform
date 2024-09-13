<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class NumericFieldValidation extends FeatureBundle
{
    private const PATTERN = '/^-?\d*((?:\.|,)\d+)?$/';

    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validate']
        );
    }

    public function validate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof NumberField) {
            return;
        }

        $value = $field->getValue();

        $min = $field->getMinValue();
        $max = $field->getMaxValue();
        $decimalCount = $field->getDecimalCount();
        $allowNegativeNumbers = $field->isAllowNegative();

        if (!preg_match(self::PATTERN, $value, $matches)) {
            $field->addError(Freeform::t('Value must be numeric'));

            return;
        }

        // If there are decimals specified
        if (isset($matches[2])) {
            if (null !== $decimalCount) {
                $decimals = substr($matches[2], 1);

                if (\strlen($decimals) > $decimalCount) {
                    $message = str_replace(
                        '{{dec}}',
                        $decimalCount,
                        Freeform::t('{{dec}} decimal places allowed')
                    );

                    $field->addError($message);
                }
            } else {
                $message = str_replace(
                    '{{dec}}',
                    0,
                    Freeform::t('{{dec}} decimal places allowed')
                );

                $field->addError($message);
            }
        }

        $numericValue = str_replace(',', '.', $value);
        $numericValue = preg_replace('/[^0-9\-\.]/', '', $numericValue);
        if ('' === $numericValue) {
            return;
        }

        $numericValue = (float) $numericValue;

        if (!$allowNegativeNumbers && $numericValue < 0) {
            $field->addError(Freeform::t('Only positive numbers allowed'));
        }

        $minEnabled = null !== $min;
        $maxEnabled = null !== $max;

        if ($minEnabled && !$maxEnabled && $numericValue < $min) {
            $message = str_replace(
                '{{min}}',
                $min,
                Freeform::t('The value must be no less than {{min}}')
            );

            $field->addError($message);
        } elseif ($maxEnabled && !$minEnabled && $numericValue > $max) {
            $message = str_replace(
                '{{max}}',
                $max,
                Freeform::t('The value must be no more than {{max}}')
            );

            $field->addError($message);
        } elseif ($minEnabled && $maxEnabled && ($numericValue < $min || $numericValue > $max)) {
            $message = str_replace(
                ['{{min}}', '{{max}}'],
                [$min, $max],
                Freeform::t('The value must be between {{min}} and {{max}}')
            );

            $field->addError($message);
        }
    }
}
