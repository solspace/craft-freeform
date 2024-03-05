<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Events\Forms\CreateSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SetSubmissionDefaultStatus extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_CREATE_SUBMISSION,
            [$this, 'setStatusId']
        );
    }

    public function setStatusId(CreateSubmissionEvent $event): void
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        $submission->statusId = $form->getSettings()->getGeneral()->defaultStatus;
    }
}
