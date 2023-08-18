<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;

class ReturnUrlEvent extends ArrayableEvent
{
    public function __construct(
        private Form $form,
        private ?Submission $submission = null,
        private ?string $returnUrl = null
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'submission', 'returnUrl'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getSubmission(): ?Submission
    {
        return $this->submission;
    }

    public function getReturnUrl(): ?string
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
