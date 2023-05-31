<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;

class SetPropertiesEvent extends ArrayableEvent implements FormEventInterface
{
    private Form $form;
    private array $properties;

    public function __construct(Form $form, array $properties = [])
    {
        $this->form = $form;
        $this->properties = $properties;

        parent::__construct();
    }

    public function fields(): array
    {
        return ['form', 'properties'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function setProperties(array $properties): self
    {
        $this->properties = $properties;

        return $this;
    }
}
