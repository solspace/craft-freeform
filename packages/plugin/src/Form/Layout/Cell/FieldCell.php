<?php

namespace Solspace\Freeform\Form\Layout\Cell;

use Solspace\Freeform\Fields\FieldInterface;

class FieldCell extends Cell
{
    private ?FieldInterface $field;

    public function __construct(array $config) {}

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function setField(FieldInterface $field): self
    {
        $this->field = $field;

        return $this;
    }
}
