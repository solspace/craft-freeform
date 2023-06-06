<?php

namespace Solspace\Freeform\Library\Attributes;

class TableAttributesCollection extends Attributes
{
    protected Attributes $table;
    protected Attributes $row;
    protected Attributes $column;
    protected Attributes $label;
    protected Attributes $input;
    protected Attributes $select;
    protected Attributes $checkbox;
    protected Attributes $addButton;
    protected Attributes $removeButton;

    public function __construct(array $attributes = [])
    {
        $this->table = new Attributes();
        $this->row = new Attributes();
        $this->column = new Attributes();
        $this->label = new Attributes();
        $this->input = new Attributes();
        $this->select = new Attributes();
        $this->checkbox = new Attributes();
        $this->addButton = new Attributes();
        $this->removeButton = new Attributes();

        parent::__construct($attributes);
    }

    public function getTable(): Attributes
    {
        return $this->table;
    }

    public function getRow(): Attributes
    {
        return $this->row;
    }

    public function getColumn(): Attributes
    {
        return $this->column;
    }

    public function getLabel(): Attributes
    {
        return $this->label;
    }

    public function getInput(): Attributes
    {
        return $this->input;
    }

    public function getSelect(): Attributes
    {
        return $this->select;
    }

    public function getCheckbox(): Attributes
    {
        return $this->checkbox;
    }

    public function getAddButton(): Attributes
    {
        return $this->addButton;
    }

    public function getRemoveButton(): Attributes
    {
        return $this->removeButton;
    }
}
