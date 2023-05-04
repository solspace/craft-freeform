<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Fields\FieldInterface;

class Condition
{
    protected FieldInterface $field;
    protected string $operator;
    protected string $value;

    public function __construct(FieldInterface $field, string $operator, string $value)
    {
        $this->field = $field;
        $this->operator = $operator;
        $this->value = $value;
    }
}
