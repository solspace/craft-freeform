<?php

namespace Solspace\Freeform\Fields\Properties\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Library\Translations\TranslationTable;

abstract class OptionsConfiguration implements OptionsConfigurationInterface
{
    private ?OptionTypeProviderInterface $configuration = null;

    private ?string $emptyOption;
    private string $typeClass;
    private array $properties;

    public function __construct(array $config, PropertyProvider $propertyProvider)
    {
        $this->emptyOption = $config['emptyOption'] ?? null;
        $this->typeClass = $config['typeClass'] ?? '';
        $this->properties = $config['properties'] ?? [];

        if ($this->typeClass) {
            $this->configuration = new $this->typeClass();
            $propertyProvider->setObjectProperties($this->configuration, $this->properties);
        }
    }

    public function getEmptyOption(): ?string
    {
        return $this->emptyOption;
    }

    public function getTypeClass(): string
    {
        return $this->typeClass;
    }

    public function getOptions(TranslationTable $translationTable): OptionCollection
    {
        if (!$this->configuration) {
            return new OptionCollection();
        }

        $collection = $this->configuration->generateOptions($translationTable);
        if ($this->emptyOption) {
            $emptyOption = $translationTable->get('optionConfiguration.emptyOption', $this->emptyOption);

            $collection->add('', $emptyOption, 0);
        }

        return $collection;
    }

    public function toArray(): array
    {
        return [
            'source' => $this->getSource(),
            'emptyOption' => $this->emptyOption,
            'typeClass' => $this->typeClass,
            'properties' => (object) $this->properties,
        ];
    }
}
