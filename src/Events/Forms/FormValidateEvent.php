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
     *
     * @param Form $form
     */
    public function __construct(Form $form)
    {
        $this->form = $form;

        parent::__construct([]);
    }

    /**
     * @inheritDoc
     */
    public function fields(): array
    {
        return ['form'];
    }

    /**
     * @return Form
     */
    public function getForm(): Form
    {
        return $this->form;
    }

    /**
     * @return bool
     * @deprecated this is no longer used, since it's redundant
     */
    public function isFormValid(): bool
    {
        return true;
    }

    /**
     * @param string $message
     *
     * @return FormValidateEvent
     */
    public function addErrorToForm(string $message): FormValidateEvent
    {
        $this->form->addError($message);

        return $this;
    }
}
