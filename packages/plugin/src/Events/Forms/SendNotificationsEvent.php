<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Services\MailerService;

class SendNotificationsEvent extends CancelableArrayableEvent
{
    /** @var MailerService */
    private $mailer;

    /** @var Form */
    private $form;

    /** @var AbstractField[] */
    private $fields;

    /** @var Submission */
    private $submission;

    public function __construct(Form $form, Submission $submission, MailerService $mailer, array $fields = [])
    {
        $this->form = $form;
        $this->submission = $submission;
        $this->mailer = $mailer;
        $this->fields = $fields;

        parent::__construct([]);
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

    public function getFields(): array
    {
        return $this->fields;
    }

    public function setFields(array $fields): self
    {
        $this->fields = $fields;

        return $this;
    }
}
