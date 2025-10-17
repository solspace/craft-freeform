<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

class Option
{
    public function __construct(
        private string $value,
        private string $label,
        private bool $optgroup = false,
    ) {}

    public function __toString(): string
    {
        return $this->getLabel();
    }

    public function getValue(): string
    {
        return trim($this->value);
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function isOptgroup(): bool
    {
        return $this->optgroup;
    }
}
