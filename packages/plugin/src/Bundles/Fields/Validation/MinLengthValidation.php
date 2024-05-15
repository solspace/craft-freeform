<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\MinLengthInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class MinLengthValidation extends FeatureBundle
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
        if (!$field instanceof MinLengthInterface) {
            return;
        }

        $value = $field->getValue();
        if (empty($value)) {
            return;
        }

        $minLength = $field->getMinLength();
        if ($minLength <= 0) {
            return;
        }

        if (\strlen($value) < $minLength) {
            $field->addError(
                Freeform::t(
                    'Value must be more than {minLength} characters',
                    ['minLength' => $minLength],
                )
            );
        }
    }
}
