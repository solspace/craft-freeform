<?php

namespace Solspace\Freeform\Bundles\Form\AiSummary;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Fields\Implementations\Pro\AiSummaryField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\ProcessAiSummaryJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\AiSummaryService;
use yii\base\Event;

class AiSummaryBundle extends FeatureBundle
{
    public function __construct(
        private AiSummaryService $aiSummaryService
    ) {
        Event::on(
            Form::class,
            Form::EVENT_SUBMIT,
            [$this, 'queueAiSummaryProcessing']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'queueAiSummaryProcessingOnSubmission']
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

    public function queueAiSummaryProcessing(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $this->queueAiSummaryProcessingForForm($form);
    }

    public function queueAiSummaryProcessingOnSubmission(ProcessSubmissionEvent $event): void
    {
        $form = $event->getForm();
        $this->queueAiSummaryProcessingForForm($form);
    }

    private function queueAiSummaryProcessingForForm(Form $form): void
    {
        $fields = $form->getLayout()->getFields();
        $hasAiSummaryFields = false;

        foreach ($fields as $field) {
            if ($field instanceof AiSummaryField) {
                $hasAiSummaryFields = true;

                break;
            }
        }

        if (!$hasAiSummaryFields) {
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

        // Queue the AI summary processing job
        $job = new ProcessAiSummaryJob([
            'formId' => $form->getId(),
            'submissionId' => $submission->getId(),
            'postedData' => $postedValues,
        ]);

        \Craft::$app->getQueue()->push($job);
    }
}
