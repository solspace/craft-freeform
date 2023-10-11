<?php

namespace Solspace\Freeform\Library\Attributes;

class FormAttributesCollection extends Attributes
{
    protected Attributes $form;
    protected Attributes $row;
    protected Attributes $success;
    protected Attributes $errors;

    public function __construct(array $attributes = [])
    {
        $this->form = new Attributes();
        $this->row = new Attributes();
        $this->success = new Attributes();
        $this->errors = new Attributes();

        parent::__construct($attributes);
    }

    public function getForm(): Attributes
    {
        return $this->form;
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
