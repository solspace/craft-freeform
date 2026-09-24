<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RangeField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RangeFieldValidation extends FeatureBundle
{
    public function __construct()
    {
        Event::on(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$this, 'validate']);
    }

    public function validate(ValidateEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof RangeField) {
            return;
        }

        $value = $field->getValue();
        if (null === $value || '' === $value) {
            return; // Required-field validation handles missing values.
        }
        if ((!\is_int($value) && !\is_float($value) && !\is_string($value)) || !is_numeric($value) || !is_finite((float) $value)) {
            $field->addError(\Craft::t('freeform', 'Value must be numeric'));

            return;
        }
        $value = (float) $value;
        $min = $field->getMinValue();
        $max = $field->getMaxValue();
        if ($value < $min || $value > $max) {
            $field->addError(strtr(\Craft::t('freeform', 'The value must be between {{min}} and {{max}}'), ['{{min}}' => $min, '{{max}}' => $max]));

            return;
        }
        $steps = ($value - $min) / $field->getStep();
        if (!is_finite($steps) || abs($steps - round($steps)) > 1e-7) {
            $field->addError(strtr(\Craft::t('freeform', 'Choose a slider value in increments of {{step}} from {{min}}.'), ['{{step}}' => $field->getStep(), '{{min}}' => $min]));
        }
    }
}
