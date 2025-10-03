<?php

namespace Solspace\Freeform\Fields\Properties\Options\Custom;

use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;
use Solspace\Freeform\Library\Translations\TranslationTable;

class Custom implements OptionsConfigurationInterface
{
    private array $options = [];
    private bool $useCustomValues;

    public function __construct(array $config = [])
    {
        $this->useCustomValues = $config['useCustomValues'] ?? false;

        $options = $config['options'] ?? [];
        foreach ($options as $option) {
            $this->options[] = new Option(
                $option['value'] ?? '',
                $option['label'] ?? '',
            );
        }
    }

    public function getSource(): string
    {
        return self::SOURCE_CUSTOM;
    }

    public function getUseCustomValues(): bool
    {
        return $this->useCustomValues;
    }

    public function getOptions(TranslationTable $translationTable): OptionCollection
    {
        $translations = $translationTable->get('optionConfiguration.options');

        $collection = new OptionCollection();
        foreach ($this->options as $option) {
            if (\is_array($translations)) {
                $translatedOption = array_find($translations, fn ($item) => $item->value === $option->getValue());
                if ($translatedOption) {
                    $option = new Option(
                        $option->getValue(),
                        $translatedOption->label,
                    );
                }
            }

            $collection->add($option);
        }

        return $collection;
    }

    public function toArray(): array
    {
        return [
            'source' => $this->getSource(),
            'useCustomValues' => $this->useCustomValues,
            'options' => array_map(
                fn (Option $option) => [
                    'label' => $option->getLabel(),
                    'value' => $option->getValue(),
                ],
                $this->options
            ),
        ];
    }
}
