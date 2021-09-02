<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Freeform\Bundles\Form\SpamControl\FormInitTime;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;

class MinimumSubmissionTime extends AbstractCheck
{
    public function handleCheck(ValidationEvent $event)
    {
        if (!$this->isMinimumSubmissionTimePassed($event->getForm())) {
            return;
        }

        if ($this->isDisplayErrors()) {
            $event->getForm()->addError(
                Freeform::t('Sorry, we cannot accept your submission at this time. Not enough time has passed before submitting the form.')
            );
        } else {
            $event->getForm()->markAsSpam(SpamReason::TYPE_MINIMUM_SUBMIT_TIME, 'Minimum submit time check failed');
        }
    }

    private function isMinimumSubmissionTimePassed(Form $form): bool
    {
        $initTime = $form->getPropertyBag()->get(FormInitTime::KEY, 0);
        $timeFormAlive = time() - $initTime;

        $minTime = $this->getSettings()->minimumSubmitTime;

        return $minTime && $timeFormAlive <= $minTime;
    }
}
