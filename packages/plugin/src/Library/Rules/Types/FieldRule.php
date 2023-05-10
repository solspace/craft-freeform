<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Rules\Rule;

class FieldRule extends Rule
{
    private FieldInterface $field;
    private string $display;

    public function getField(): FieldInterface
    {
        return $this->field;
    }

    public function setField(FieldInterface $field): self
    {
        $this->field = $field;

        return $this;
    }

    public function getDisplay(): string
    {
        return $this->display;
    }

    public function setDisplay(string $display): self
    {
        $this->display = $display;

        return $this;
    }
}
