<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class CreateSubmissionEvent extends ArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form, private Submission $submission)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'submission'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }
}
