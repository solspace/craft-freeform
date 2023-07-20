<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\CancelableArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;

class ValidateEvent extends CancelableArrayableEvent implements FormEventInterface
{
    public function __construct(
        private Form $form,
        private FieldInterface $field
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['field'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }
}
