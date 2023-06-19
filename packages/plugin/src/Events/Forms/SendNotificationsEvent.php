<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\MailerService;

class SendNotificationsEvent extends CancelableArrayableEvent
{
    public function __construct(
        private Form $form,
        private Submission $submission,
        private FieldCollection $fields,
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

    public function getFields(): FieldCollection
    {
        return $this->fields;
    }

    public function setFields(FieldCollection $fields): self
    {
        $this->fields = $fields;

        return $this;
    }
}
