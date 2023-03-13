<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class SubmitEvent extends CancelableArrayableEvent implements FormEventInterface
{
    /** @var Form */
    private $form;

    /** @var Submission */
    private $submission;

    public function __construct(Form $form, Submission $submission)
    {
        $this->form = $form;
        $this->submission = $submission;

        parent::__construct([]);
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
