<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class AttachFormAttributesEvent extends ArrayableEvent
{
    /** @var Form */
    private $form;

    /** @var array */
    private $attributes;

    public function __construct(Form $form, array $attributes = [])
    {
        $this->form = $form;
        $this->attributes = $attributes;

        parent::__construct([]);
    }

    public function fields(): array
    {
        return ['form', 'attributes'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function setAttributes(array $value): self
    {
        $this->attributes = $value;

        return $this;
    }

    public function attachAttribute(string $name, $value): self
    {
        $this->attributes[$name] = $value;

        return $this;
    }

    public function removeAttribute(string $name): self
    {
        if (isset($this->attributes[$name])) {
            unset($this->attributes[$name]);
        }

        return $this;
    }
}
