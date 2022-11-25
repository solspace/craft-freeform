<?php

namespace Solspace\Freeform\Form\Layout\Cell;

use Solspace\Freeform\Bundles\GraphQL\Interfaces\FieldInterface;

class FieldCell extends Cell
{
    private ?FieldInterface $field;

    public function __construct(array $config)
    {
    }

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function setField(FieldInterface $field)
    {
        $this->field = $field;
    }
}
