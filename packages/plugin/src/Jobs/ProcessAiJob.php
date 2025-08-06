<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\Fields\AiField;

class ProcessAiJob extends BaseJob
{
    public ?int $formId = null;
    public ?int $submissionId = null;
    public array $postedData = [];
    public ?int $siteId = null;

    public function __construct($config = [])
    {
        parent::__construct($config);
        $this->siteId = \Craft::$app->getSites()->getCurrentSite()->id;
    }

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $form = $freeform->forms->getFormById($this->formId);
        if (!$form) {
            return;
        }

        $submission = $freeform->submissions->getSubmissionById($this->submissionId);
        if (!$submission) {
            return;
        }

        // Set the form values from the posted data
        $form->valuesFromArray($this->postedData);

        // Get AI fields
        $fields = $form->getLayout()->getFields();
        $aiFields = [];

        foreach ($fields as $field) {
            if ($field instanceof AiField) {
                $aiFields[] = $field;
            }
        }

        if (empty($aiFields)) {
            return;
        }

        $aiService = $freeform->ai;
        $submissionsService = $freeform->submissions;

        foreach ($aiFields as $field) {
            try {
                // Skip if already processed
                if (!empty($field->getValue())) {
                    continue;
                }

                $aiResult = $aiService->processAiField($form, $field);
                if (null !== $aiResult) {
                    // Update the submission with the AI result
                    $submission->setFormFieldValues([$field->getHandle() => $aiResult], false);
                    $submissionsService->storeSubmission($form, $submission);
                }
            } catch (\Exception $e) {
                // Continue processing, do not throw
            }
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing AI');
    }
}
