<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

class CheckboxesItem extends SelectItem
{
    public function getValue(): mixed
    {
        if (null === $this->value) {
            return [];
        }

        if (empty($this->value)) {
            return [];
        }

        if (!\is_array($this->value)) {
            return [$this->value];
        }

        return $this->value;
    }
}
