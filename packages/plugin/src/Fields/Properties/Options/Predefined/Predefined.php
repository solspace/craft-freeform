<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined;

use Solspace\Freeform\Fields\Properties\Options\OptionsConfiguration;

class Predefined extends OptionsConfiguration
{
    public function getSource(): string
    {
        return self::SOURCE_PREDEFINED;
    }
}
