<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RatingFieldValidation extends FeatureBundle
{
    private const PATTERN = '/^-?\\d*((?:\\.|,)\\d+)?$/';

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
        if (!$field instanceof RatingField) {
            return;
        }

        $value = $field->getValue();

        $min = 1;
        $max = $field->getMaxValue();

        if (!preg_match(self::PATTERN, $value, $matches)) {
            $field->addError(Freeform::t('Value must be numeric'));

            return;
        }

        $numericValue = str_replace(',', '.', $value);
        $numericValue = preg_replace('/[^0-9\\-\\.]/', '', $numericValue);
        if ('' === $numericValue) {
            return;
        }

        $numericValue = (float) $numericValue;

        if ($numericValue < 0) {
            $field->addError(Freeform::t('Rating must be positive'));
        }

        if ($numericValue < $min || $numericValue > $max) {
            $message = str_replace(
                ['{{min}}', '{{max}}'],
                [$min, $max],
                Freeform::t('Rating must be between {{min}} and {{max}}')
            );

            $field->addError($message);
        }
    }
}
