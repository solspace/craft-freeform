<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\MailerService;

class SendNotificationsEvent extends CancelableArrayableEvent
{
    public function __construct(
        private Form $form,
        private Submission $submission,
        private MailerService $mailer
    ) {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    public function getMailer(): MailerService
    {
        return $this->mailer;
    }
}
