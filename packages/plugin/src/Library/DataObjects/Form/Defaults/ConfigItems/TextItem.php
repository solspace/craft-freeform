<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

class TextItem extends BaseConfigItem
{
    public function getValue(): string
    {
        return (string) $this->value;
    }
}
