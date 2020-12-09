<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class FormValidateEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /**
     * FormValidateEvent constructor.
     */
    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @deprecated this is no longer used, since it's redundant
     */
    public function isFormValid(): bool
    {
        return true;
    }

    public function addErrorToForm(string $message): self
    {
        $this->form->addError($message);

        return $this;
    }
}
