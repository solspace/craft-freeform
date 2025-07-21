<?php

namespace Solspace\Freeform\Bundles\Form\Ai;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Jobs\ProcessAiJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\AiService;
use yii\base\Event;

class AiBundle extends FeatureBundle
{
    public function __construct(
        private AiService $aiService
    ) {
        Event::on(
            Form::class,
            Form::EVENT_SUBMIT,
            [$this, 'queueAiProcessing']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'queueAiProcessingOnSubmission']
        );
    }

    public static function getPriority(): int
    {
        return 100; // Run before notifications
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function queueAiProcessing(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $this->queueAiProcessingForForm($form);
    }

    public function queueAiProcessingOnSubmission(ProcessSubmissionEvent $event): void
    {
        $form = $event->getForm();
        $this->queueAiProcessingForForm($form);
    }

    private function queueAiProcessingForForm(Form $form): void
    {
        $fields = $form->getLayout()->getFields();
        $hasAiFields = false;

        foreach ($fields as $field) {
            if ($field instanceof AiField) {
                $hasAiFields = true;

                break;
            }
        }

        if (!$hasAiFields) {
            return;
        }

        $submission = $form->getSubmission();
        if (!$submission || !$submission->getId()) {
            return;
        }

        // Get the posted values from the submission
        $postedValues = [];
        foreach ($submission as $field) {
            $postedValues[$field->getHandle()] = $field->getValue();
        }

        // Queue the AI processing job
        $job = new ProcessAiJob([
            'formId' => $form->getId(),
            'submissionId' => $submission->getId(),
            'postedData' => $postedValues,
        ]);

        \Craft::$app->getQueue()->push($job);
    }
}
