<?php

namespace Solspace\Freeform\Fields\Properties\OpinionScale;

class Legend
{
    public function __construct(private string $label) {}

    public function __toString(): string
    {
        return $this->label;
    }
}
