<?php

namespace Solspace\Freeform\Library\Attributes;

class FieldAttributesCollection extends Attributes
{
    protected Attributes $input;
    protected Attributes $label;
    protected Attributes $instructions;
    protected Attributes $container;
    protected Attributes $error;

    public function __construct(array $attributes = [])
    {
        $this->input = new Attributes();
        $this->label = new Attributes();
        $this->instructions = new Attributes();
        $this->container = new Attributes();
        $this->error = new Attributes();

        parent::__construct($attributes);
    }

    public function getInput(): Attributes
    {
        return $this->input;
    }

    public function getLabel(): Attributes
    {
        return $this->label;
    }

    public function getInstructions(): Attributes
    {
        return $this->instructions;
    }

    public function getContainer(): Attributes
    {
        return $this->container;
    }

    public function getError(): Attributes
    {
        return $this->error;
    }
}
