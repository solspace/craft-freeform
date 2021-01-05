<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class ReturnUrlEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var Submission */
    private $submission;

    /** @var string */
    private $returnUrl;

    /**
     * ReturnUrlEvent constructor.
     *
     * @param Submission $submission
     * @param string     $returnUrl
     */
    public function __construct(Form $form, Submission $submission = null, string $returnUrl = null)
    {
        $this->form = $form;
        $this->submission = $submission;
        $this->returnUrl = $returnUrl;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['form', 'submission', 'returnUrl'];
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

    /**
     * @return null|string
     */
    public function getReturnUrl()
    {
        return $this->returnUrl;
    }

    /**
     * @param string $returnUrl
     */
    public function setReturnUrl(string $returnUrl = null): self
    {
        $this->returnUrl = $returnUrl;

        return $this;
    }
}
