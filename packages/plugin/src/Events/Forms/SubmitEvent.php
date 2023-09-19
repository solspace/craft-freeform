<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class SubmitEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form)
    {
        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSubmission(): Submission
    {
        return $this->getForm()->getSubmission();
    }
}
