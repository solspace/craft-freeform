<?php

namespace Solspace\Freeform\Events\Fields;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;

class ValidateEvent extends ArrayableEvent
{
    public function __construct(private FieldInterface $field, private Form $form)
    {
        parent::__construct([]);
    }

    /**
     * {@inheritDoc}
     */
    public function fields(): array
    {
        return ['field', 'form'];
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function getForm(): Form
    {
        return $this->form;
    }
}
