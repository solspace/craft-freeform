<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormStopSubmissionsAfter extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'handler']
        );
    }

    public function handler(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $status = FormSchedule::getStatus($form->getSettings()->getBehavior());
        if (FormSchedule::PENDING === $status) {
            $form->addError($form->getScheduleMessage() ?: Freeform::t('This form is not available yet.'));
        } elseif (FormSchedule::EXPIRED === $status) {
            $form->addError($form->getScheduleMessage() ?: Freeform::t('This form can no longer be submitted.'));
        }

        if (null !== $status && $event instanceof ValidationEvent) {
            $event->setValidationOverride(false);
        }
    }
}
