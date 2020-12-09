<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class UpdateEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $submission;

    /** @var Form */
    private $form;

    public function __construct(Submission $submission, Form $form)
    {
        $this->submission = $submission;
        $this->form = $form;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['submission', 'form']);
    }

    public function getSubmission(): Submission
    {
        return $this->submission;
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
