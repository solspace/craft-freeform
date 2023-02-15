<?php

namespace Solspace\Freeform\Fields\Properties\Options;

class Option implements \JsonSerializable
{
    public string $label;
    public string $value;
    public bool $checked;

    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'value' => $this->value,
            'checked' => $this->checked,
        ];
    }
}
