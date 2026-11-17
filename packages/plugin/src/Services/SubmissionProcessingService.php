<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Ai\AiService;
use yii\base\Event;

class SubmissionProcessingService
{
    public function __construct(private AiService $aiService) {}

    public function process(Form $form, Submission $submission): void
    {
        if ($submission->isSpam || $form->isMarkedAsSpam()) {
            return;
        }

        // Do not publish any outbound jobs until the AI step has completed.
        // Queue priorities cannot establish dependencies across multiple workers.
        if (!$form->isDisabled()->api) {
            $this->aiService->processAiFields($form, $submission);
        }

        Event::trigger(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, new ProcessSubmissionEvent($form, $submission));
    }
}
