<?php

namespace Solspace\Freeform\Library\Attributes;

class FormAttributesCollection extends Attributes
{
    protected Attributes $row;
    protected Attributes $error;

    public function __construct(array $attributes = [])
    {
        $this->row = new Attributes();
        $this->error = new Attributes();

        parent::__construct($attributes);
    }

    public function getRow(): Attributes
    {
        return $this->row;
    }

    public function getError(): Attributes
    {
        return $this->error;
    }
}
