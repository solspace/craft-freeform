<?php

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SubmissionProcessingService;

class ProcessSubmissionJob extends BaseJob implements FormJobInterface
{
    public ?int $formId = null;
    public ?int $submissionId = null;
    public ?int $siteId = null;
    public array|bool|null $disabled = null;
    public array $postedData = [];
    public array $submissionMetadata = [];

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();
        $sites = \Craft::$app->getSites();
        $originalSiteId = $sites->getCurrentSite()->id;
        $originalLanguage = \Craft::$app->language;
        $form = null;
        $originalDisabled = null;
        $contextApplied = false;

        try {
            if ($this->siteId) {
                $sites->setCurrentSite($this->siteId);
            }
            \Craft::$app->language = $sites->getCurrentSite()->language;
            $form = $freeform->forms->getFormById($this->formId, $sites->getCurrentSite()->handle)
                ?? $freeform->forms->getFormById($this->formId);
            if (!$form) {
                return;
            }
            $submission = $this->submissionId
                ? $freeform->submissions->getSubmissionById($this->submissionId)
                : $this->createUnstoredSubmission($form);
            if (!$submission || $submission->isSpam) {
                return;
            }

            $originalDisabled = $form->getProperties()->get(Form::DATA_DISABLE);
            $contextApplied = true;
            $form->getProperties()->set(Form::DATA_DISABLE, $this->disabled);
            $form->setSubmission($submission);
            $form->valuesFromSubmission($submission);
            \Craft::$container->get(SubmissionProcessingService::class)->process($form, $submission);
        } finally {
            if ($form && $contextApplied) {
                $form->getProperties()->set(Form::DATA_DISABLE, $originalDisabled);
            }
            $sites->setCurrentSite($originalSiteId);
            \Craft::$app->language = $originalLanguage;
        }
    }

    protected function createUnstoredSubmission(Form $form): Submission
    {
        $submission = Submission::create($form);
        $submission->siteId = $this->siteId;
        foreach (['uid', 'title', 'ip', 'userId', 'statusId'] as $attribute) {
            if (\array_key_exists($attribute, $this->submissionMetadata)) {
                $submission->{$attribute} = $this->submissionMetadata[$attribute];
            }
        }
        if ($this->submissionMetadata['dateCreated'] ?? null) {
            $submission->dateCreated = new \DateTime($this->submissionMetadata['dateCreated']);
        }
        $submission->setFormFieldValues($this->postedData);

        return $submission;
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Submission');
    }
}
