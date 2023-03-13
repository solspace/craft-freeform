<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;

/**
 * @deprecated Use SetPropertiesEvent instead. Will be removed in Freeform 4.x
 */
class UpdateAttributesEvent extends ArrayableEvent
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
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function setAttributes(array $attributes): self
    {
        $this->attributes = $attributes;

        return $this;
    }

    public function addAttribute(string $key, $value): self
    {
        $this->attributes[$key] = $value;

        return $this;
    }

    public function removeAttribute(string $key): self
    {
        if (isset($this->attributes[$key])) {
            unset($this->attributes[$key]);
        }

        return $this;
    }
}
