<?php

namespace Solspace\Freeform\Library\Attributes;

class FormAttributesCollection extends Attributes
{
    protected Attributes $row;
    protected Attributes $success;
    protected Attributes $errors;

    public function __construct(array $attributes = [])
    {
        $this->row = new Attributes();
        $this->success = new Attributes();
        $this->errors = new Attributes();

        parent::__construct($attributes);
    }

    public function getRow(): Attributes
    {
        return $this->row;
    }

    public function getSuccess(): Attributes
    {
        return $this->success;
    }

    public function getErrors(): Attributes
    {
        return $this->errors;
    }
}
