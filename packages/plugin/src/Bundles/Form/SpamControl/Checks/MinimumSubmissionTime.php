<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

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

        $event->getForm()->markAsSpam(SpamReason::TYPE_MINIMUM_SUBMIT_TIME, 'Minimum submit time check failed');

        if ($this->isDisplayErrors()) {
            $event->getForm()->addError(
                Freeform::t('Sorry, we cannot accept your submission at this time. Not enough time has passed before submitting the form.')
            );
        }
    }

    private function isMinimumSubmissionTimePassed(Form $form): bool
    {
        $initTime = $form->getInitTime();
        $timeFormAlive = time() - $initTime;

        $minTime = $this->getSettings()->minimumSubmitTime;

        return $minTime && $timeFormAlive <= $minTime;
    }
}
