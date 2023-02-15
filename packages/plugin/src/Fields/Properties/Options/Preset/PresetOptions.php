<?php

namespace Solspace\Freeform\Fields\Properties\Options\Preset;

use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;

class PresetOptions extends OptionsCollection
{
    public function jsonSerialize()
    {
        return $this->options;
    }
}
