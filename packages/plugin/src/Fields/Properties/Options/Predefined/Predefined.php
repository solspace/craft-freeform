<?php

namespace Solspace\Freeform\Fields\Properties\Options\Predefined;

use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;

class Predefined implements OptionsConfigurationInterface
{
    public function getSource(): string
    {
        return self::SOURCE_PREDEFINED;
    }
}
