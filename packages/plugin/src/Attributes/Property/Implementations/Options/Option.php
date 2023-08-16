<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

class Option
{
    public function __construct(
        private string $value,
        private string $label,
        private bool $checked,
    ) {
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function isChecked(): bool
    {
        return $this->checked;
    }
}
