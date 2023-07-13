<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\CreateSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CreateSubmission extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_CREATE_SUBMISSION,
            [$this, 'createSubmission']
        );
    }

    public static function getPriority(): int
    {
        return 1;
    }

    public function createSubmission(CreateSubmissionEvent $event): void
    {
        $form = $event->getForm();

        $submission = Submission::create($form);

        $form->setSubmission($submission);
    }
}
