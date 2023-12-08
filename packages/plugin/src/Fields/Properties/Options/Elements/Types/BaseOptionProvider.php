<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;

abstract class BaseOptionProvider implements OptionTypeProviderInterface
{
    public function generateOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        foreach ($this->getElements() as $element) {
            $value = ElementHelper::extractFieldValue($element, $this->getValue());
            $label = ElementHelper::extractFieldValue($element, $this->getLabel());

            if (null !== $value && !empty($label)) {
                $collection->add($value, $label);
            }
        }

        return $collection;
    }

    abstract protected function getElements(): array;
}
