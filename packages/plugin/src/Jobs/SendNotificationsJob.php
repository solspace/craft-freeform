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
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;

class SendNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public ?int $formId = null;

    public ?int $submissionId = null;

    public array $postedData = [];

    public ?RecipientCollection $recipients = null;

    public ?NotificationTemplate $template = null;

    public function execute($queue): void
    {
        if (!$this->recipients) {
            return;
        }

        if (!$this->template) {
            return;
        }

        $freeform = Freeform::getInstance();

        $form = $freeform->forms->getFormById($this->formId);
        if (!$form) {
            return;
        }

        $form->valuesFromArray($this->postedData);

        $submission = $freeform->submissions->getSubmissionById($this->submissionId);

        $freeform->mailer->sendEmail(
            $form,
            $this->recipients,
            $this->template,
            $submission,
        );
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Notifications');
    }
}
