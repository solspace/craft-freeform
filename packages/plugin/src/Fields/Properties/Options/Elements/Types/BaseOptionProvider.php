<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements\Types;

use craft\base\Element;
use JetBrains\PhpStorm\ArrayShape;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Library\Helpers\ElementHelper;
use Solspace\Freeform\Library\Translations\TranslationTable;

abstract class BaseOptionProvider implements OptionTypeProviderInterface
{
    public function generateOptions(?TranslationTable $translationTable = null): OptionCollection
    {
        $collection = new OptionCollection();

        foreach ($this->getElements($translationTable) as $element) {
            [$label, $value] = $this->prepareLabelAndValue($element, $collection, $translationTable);

            if (null !== $value && !empty($label)) {
                $collection->add($value, $label);
            }
        }

        return $collection;
    }

    #[ArrayShape(['label' => 'string', 'value' => 'mixed'])]
    protected function prepareLabelAndValue(
        Element $element,
        OptionCollection $collection,
        ?TranslationTable $translationTable = null
    ): array {
        if ($translationTable) {
            $value = $translationTable->get('optionConfiguration.properties.value', $this->getValue());
            $label = $translationTable->get('optionConfiguration.properties.label', $this->getLabel());
        } else {
            $value = $this->getValue();
            $label = $this->getLabel();
        }

        $value = ElementHelper::extractFieldValue($element, $value);
        $label = ElementHelper::extractFieldValue($element, $label);

        return [$label, $value];
    }

    abstract protected function getElements(TranslationTable $translationTable): array;
}
