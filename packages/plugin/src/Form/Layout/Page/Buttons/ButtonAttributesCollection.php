<?php

namespace Solspace\Freeform\Form\Layout\Page\Buttons;

use Solspace\Freeform\Library\Attributes\Attributes;

class ButtonAttributesCollection extends Attributes
{
    protected Attributes $container;
    protected Attributes $column;
    protected Attributes $buttonWrapper;
    protected Attributes $submit;
    protected Attributes $back;
    protected Attributes $save;

    public function __construct(array $attributes = [])
    {
        $this->container = new Attributes();
        $this->column = new Attributes();
        $this->buttonWrapper = new Attributes();

        $this->submit = new Attributes();
        $this->back = new Attributes();
        $this->save = new Attributes();

        parent::__construct($attributes);
    }

    public function getContainer(): Attributes
    {
        return $this->container;
    }

    public function getColumn(): Attributes
    {
        return $this->column;
    }

    public function getButtonWrapper(): Attributes
    {
        return $this->buttonWrapper;
    }

    public function getSubmit(): Attributes
    {
        return $this->submit;
    }

    public function getBack(): Attributes
    {
        return $this->back;
    }

    public function getSave(): Attributes
    {
        return $this->save;
    }
}
