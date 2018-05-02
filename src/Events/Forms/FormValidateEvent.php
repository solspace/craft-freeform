<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormValidateEvent extends Event
{
    /** @var Form */
    private $form;

    /** @var bool */
    private $formValid;

    /**
     * FormValidateEvent constructor.
     *
     * @param Form $form
     * @param bool $formValid
     */
    public function __construct(Form $form, bool $formValid)
    {
        $this->form      = $form;
        $this->formValid = $formValid;

        parent::__construct([]);
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
     */
    public function isFormValid(): bool
    {
        return $this->formValid;
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