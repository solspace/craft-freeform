<?php

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Fields\DataContainers\Option;

trait OptionsKeyValuePairTrait
{
    public function getOptionsAsKeyValuePairs(): array
    {
        $pairs = [];

        /** @var Option $option */
        foreach ($this->getOptions() as $option) {
            $pairs[$option->getValue()] = $option->getLabel();
        }

        return $pairs;
    }
}
