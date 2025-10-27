<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

class ColorItem extends BaseConfigItem
{
    public function getValue(): string
    {
        if (null === $this->value) {
            return '';
        }

        if (6 === \strlen($this->value)) {
            return '#'.$this->value;
        }

        return (string) $this->value;
    }
}
