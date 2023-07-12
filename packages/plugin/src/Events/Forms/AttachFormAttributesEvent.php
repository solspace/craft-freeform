<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class AttachFormAttributesEvent extends ArrayableEvent implements FormEventInterface
{
    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
