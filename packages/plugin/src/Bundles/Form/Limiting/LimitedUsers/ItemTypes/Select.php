<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes;

class Select extends BaseItemType
{
    public string $type = 'select';
    public string $value = '';
    public array $options = [];

    public function setValue(string $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function setOptions(array $options): self
    {
        $this->options = [];
        foreach ($options as $key => $value) {
            $this->options[] = ['value' => $key, 'label' => $value];
        }

        return $this;
    }
}
