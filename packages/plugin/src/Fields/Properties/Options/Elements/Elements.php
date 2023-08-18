<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements;

use Solspace\Freeform\Fields\Properties\Options\OptionsConfiguration;

class Elements extends OptionsConfiguration
{
    public function getSource(): string
    {
        return self::SOURCE_ELEMENTS;
    }
}
