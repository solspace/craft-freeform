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

class SendNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public ?int $formId = null;

    public ?int $submissionId = null;

    public ?string $recipients = null;

    public ?string $template = null;

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

        $form->valuesFromSubmission($submission);

        $fields = $form->getLayout()->getFields();

        $recipients = unserialize($this->recipients);
        if (!$recipients) {
            return;
        }

        $template = unserialize($this->template);
        if (!$template) {
            return;
        }

        $freeform->mailer->sendEmail(
            $form,
            $recipients,
            $fields,
            $template,
            $submission,
        );
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Notifications');
    }
}
