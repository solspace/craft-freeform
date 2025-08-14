<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CardChoiceCountValidation extends FeatureBundle
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
        if (!$field instanceof CardsField) {
            return;
        }

        $value = $field->getValue();
        if (empty($value)) {
            return;
        }

        $maxValues = $field->getMaxSelectedValues();
        if ($maxValues <= 0) {
            return;
        }

        if (\count($value) > $maxValues) {
            $field->addError(
                Freeform::t(
                    'You can select no more than {maxValues} values',
                    ['maxValues' => $maxValues]
                )
            );
        }
    }
}
