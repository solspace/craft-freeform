<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

trait OptionsKeyValuePairTrait
{
    /**
     * @return array
     */
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