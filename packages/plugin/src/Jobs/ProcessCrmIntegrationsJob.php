<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;

class ProcessCrmIntegrationsJob extends BaseJob implements IntegrationJobInterface
{
    public ?int $formId = null;

    public ?int $submissionId = null;

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

        $form = FreeformQueueHandler::rehydrateForm($form, $submission);

        $freeform->integrations->processIntegrations($form, CRMIntegrationInterface::class);
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing CRM Integrations');
    }
}
