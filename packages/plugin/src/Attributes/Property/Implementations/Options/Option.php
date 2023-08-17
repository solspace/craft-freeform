<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

class Option
{
    public function __construct(
        private string $value,
        private string $label,
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
}
