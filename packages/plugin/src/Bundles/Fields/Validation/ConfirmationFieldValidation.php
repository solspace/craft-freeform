<?php

namespace Solspace\Freeform\Bundles\Fields\Validation;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\SubmissionsService;
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

        Event::on(
            SubmissionsService::class,
            SubmissionsService::EVENT_BEFORE_SUBMIT,
            [$this, 'beforeSubmit']
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

    public function beforeSubmit(SubmitEvent $event): void
    {
        $form = $event->getForm();

        /** @var ConfirmationField[] $confirmFields */
        $confirmFields = $form->getFields()->getList(ConfirmationField::class);
        if (!$confirmFields->count()) {
            return;
        }

        $submission = $event->getSubmission();

        foreach ($confirmFields as $field) {
            if (!$field->getTargetField() instanceof NoStorageInterface) {
                continue;
            }

            $submission->{$field->getHandle()}->setValue(null);
        }
    }
}
