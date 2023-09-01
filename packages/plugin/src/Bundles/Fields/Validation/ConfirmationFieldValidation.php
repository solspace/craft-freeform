<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class ConfirmationFieldValidation extends FeatureBundle
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
        if (!$field instanceof ConfirmationField) {
            return;
        }

        $form = $event->getForm();

        $targetFieldUid = $field->getTargetField()?->getUid();
        if (!$targetFieldUid) {
            return;
        }

        $targetField = $form->get($targetFieldUid);
        if (!$targetField) {
            return;
        }

        $targetValue = $targetField->getValue();
        if ($targetValue !== $field->getValue()) {
            $field->addError(
                Freeform::t(
                    'This value must match the value for {targetFieldLabel}',
                    ['targetFieldLabel' => $targetField->getLabel()],
                )
            );
        }
    }
}
