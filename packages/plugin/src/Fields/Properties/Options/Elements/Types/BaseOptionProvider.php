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

    protected function getQueryOrder(TranslationTable $translations, string $orderBy, string $sort): array
    {
        $orderBy = $translations->get('optionConfiguration.properties.orderBy') ?: $orderBy;
        $sort = $translations->get('optionConfiguration.properties.sort') ?: $sort;

        // Craft maps bare identifiers to element attributes and custom field handles.
        $column = \is_string($orderBy) && preg_match('/\A[a-zA-Z_][a-zA-Z0-9_]*\z/', $orderBy) ? $orderBy : 'id';
        $direction = \is_string($sort) && 0 === strcasecmp($sort, 'desc') ? \SORT_DESC : \SORT_ASC;

        return [$column => $direction];
    }

    abstract protected function getElements(TranslationTable $translationTable): array;
}
