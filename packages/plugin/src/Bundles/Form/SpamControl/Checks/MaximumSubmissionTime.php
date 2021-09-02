<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Freeform\Bundles\Form\SpamControl\FormInitTime;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;

class MaximumSubmissionTime extends AbstractCheck
{
    public function handleCheck(ValidationEvent $event)
    {
        if (!$this->isMaximumSubmissionTimePassed($event->getForm())) {
            return;
        }

        if ($this->isDisplayErrors()) {
            $event->getForm()->addError(
                Freeform::t('Sorry, we cannot accept your submission at this time. Too much time has passed before submitting the form.')
            );
        } else {
            $event->getForm()->markAsSpam(SpamReason::TYPE_MAXIMUM_SUBMIT_TIME, 'Maximum submit time check failed');
        }
    }

    private function isMaximumSubmissionTimePassed(Form $form): bool
    {
        $initTime = $form->getPropertyBag()->get(FormInitTime::KEY, 0);
        $timeFormAlive = time() - $initTime;

        $maxTime = $this->getSettings()->formSubmitExpiration;

        return $maxTime && $timeFormAlive >= $maxTime * 60;
    }
}
