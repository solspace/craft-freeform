<?php

namespace Solspace\Freeform\Library\Attributes;

class FieldAttributesCollection extends Attributes
{
    protected Attributes $input;
    protected Attributes $label;
    protected Attributes $instructions;
    protected Attributes $container;
    protected Attributes $error;
    protected Attributes $option;
    protected Attributes $optionLabel;
    protected Attributes $typedContainer;
    protected Attributes $typedInput;
    protected Attributes $typedLabel;

    public function __construct(?array $attributes = [])
    {
        $this->input = new Attributes();
        $this->label = new Attributes();
        $this->instructions = new Attributes();
        $this->container = new Attributes();
        $this->error = new Attributes();
        $this->option = new Attributes();
        $this->optionLabel = new Attributes();
        $this->typedContainer = new Attributes();
        $this->typedInput = new Attributes();
        $this->typedLabel = new Attributes();

        parent::__construct($attributes ?? []);
    }

    public function getTypedContainer(): Attributes
    {
        return $this->typedContainer;
    }

    public function getTypedInput(): Attributes
    {
        return $this->typedInput;
    }

    public function getTypedLabel(): Attributes
    {
        return $this->typedLabel;
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

    public function getOptionLabel(): Attributes
    {
        return $this->optionLabel;
    }

    public function getOption(): Attributes
    {
        return $this->option;
    }
}
