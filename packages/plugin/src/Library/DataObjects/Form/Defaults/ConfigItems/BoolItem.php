<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

class BoolItem extends BaseConfigItem
{
    public function getValue(): bool
    {
        return (bool) $this->value;
    }
}
