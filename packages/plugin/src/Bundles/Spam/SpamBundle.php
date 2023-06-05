<?php

namespace Solspace\Freeform\Bundles\Spam;

use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SpamBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'processSpamSubmission']
        );
    }

    public static function getPriority(): int
    {
        return 800;
    }

    public function processSpamSubmission(ProcessSubmissionEvent $event): void
    {
        // TODO: refactor due to mailing list field changes
        $form = $event->getForm();
        $submission = $event->getSubmission();

        if (!$submission instanceof SpamSubmission || !$submission->id) {
            return;
        }

        $this->plugin()->integrationsQueue->enqueueIntegrations($submission, []);

        // Prevent further processing of this submission
        $event->isValid = false;
    }
}
