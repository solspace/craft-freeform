<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class AfterSubmitEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var Submission */
    private $submission;

    public function __construct(Form $form, Submission $submission = null)
    {
        $this->form = $form;
        $this->submission = $submission;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['form', 'submission'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return null|Submission
     */
    public function getSubmission()
    {
        return $this->submission;
    }
}
