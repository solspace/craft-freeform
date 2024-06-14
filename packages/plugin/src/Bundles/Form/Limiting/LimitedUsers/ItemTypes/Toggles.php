<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\ItemTypes;

class Toggles extends BaseItemType
{
    public string $type = 'toggles';
    public array $values = [];
    public array $options = [];

    public function setValues(array $values): self
    {
        $this->values = $values;

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
