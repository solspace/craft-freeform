<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;
use Solspace\Freeform\Library\Translations\TranslationTable;

abstract class BaseOptionProvider implements OptionTypeProviderInterface
{
    public function generateOptions(?TranslationTable $translationTable): OptionCollection
    {
        $collection = new OptionCollection();

        foreach ($this->getElements($translationTable) as $element) {
            $value = $translationTable->get('optionConfiguration.properties.value', $this->getValue());
            $label = $translationTable->get('optionConfiguration.properties.label', $this->getLabel());

            $value = ElementHelper::extractFieldValue($element, $value);
            $label = ElementHelper::extractFieldValue($element, $label);

            if (null !== $value && !empty($label)) {
                $collection->add($value, $label);
            }
        }

        return $collection;
    }

    abstract protected function getElements(TranslationTable $translationTable): array;
}
