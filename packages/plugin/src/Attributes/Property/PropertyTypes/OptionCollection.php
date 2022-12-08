<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes;

class OptionCollection
{
    private array $options = [];

    public function add(string $value, string $label): self
    {
        $this->options[] = ['value' => $value, 'label' => $label];

        return $this;
    }

    public function getOptions(): array
    {
        return $this->options;
    }
}
