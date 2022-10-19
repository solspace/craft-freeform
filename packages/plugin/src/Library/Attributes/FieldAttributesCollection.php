<?php

namespace Solspace\Freeform\Library\Attributes;

class FieldAttributesCollection extends Attributes
{
    private Attributes $input;
    private Attributes $label;
    private Attributes $instructions;
    private Attributes $container;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->input = new Attributes();
        $this->label = new Attributes();
        $this->instructions = new Attributes();
        $this->container = new Attributes();
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
}
