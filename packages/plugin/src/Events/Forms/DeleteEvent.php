<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class DeleteEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return array_merge(parent::fields(), ['form']);
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getModel(): Form
    {
        return $this->getForm();
    }
}
