<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\MaxLengthInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class MaxLengthValidation extends FeatureBundle
{
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
        if (!$field instanceof MaxLengthInterface) {
            return;
        }

        $maxLength = $field->getMaxLength();
        if ($maxLength <= 0) {
            return;
        }

        $value = $field->getValue();
        if (\strlen($value) > $maxLength) {
            $field->addError(
                Freeform::t(
                    'Value must be no more than {maxLength} characters',
                    ['maxLength' => $maxLength]
                )
            );
        }
    }
}
