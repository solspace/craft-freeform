<?php

namespace Solspace\Freeform\Fields\Properties\OpinionScale;

class Scale
{
    public function __construct(
        private string $value,
        private string $label,
    ) {
    }

    public function __toString(): string
    {
        return $this->getLabel();
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getValue(): string
    {
        return $this->value;
    }
}
