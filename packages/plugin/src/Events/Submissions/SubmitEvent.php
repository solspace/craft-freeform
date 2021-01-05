<?php

namespace Solspace\Freeform\Events\Submissions;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class SubmitEvent extends CancelableArrayableEvent
{
    /** @var Submission */
    private $element;

    /** @var Form */
    private $form;

    public function __construct(Submission $element, Form $form)
    {
        $this->element = $element;
        $this->form = $form;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['element', 'form']);
    }

    /**
     * @deprecated Use ::getSubmission() instead
     */
    public function getElement(): Submission
    {
        return $this->element;
    }

    public function getSubmission(): Submission
    {
        return $this->element;
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
