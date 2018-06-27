<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;
use Solspace\Freeform\Library\Composer\Components\Fields\DynamicRecipientField;

trait OptionsKeyValuePairTrait
{
    /**
     * @return array
     */
    public function getOptionsAsKeyValuePairs(): array
    {
        $pairs = [];

        if ($this instanceof DynamicRecipientField) {
            /** @var Option $option */
            foreach ($this->getOptions() as $index => $option) {
                $pairs[$index] = $option->getLabel();
            }
        } else {
            /** @var Option $option */
            foreach ($this->getOptions() as $option) {
                $pairs[$option->getValue()] = $option->getLabel();
            }
        }

        return $pairs;
    }
}
