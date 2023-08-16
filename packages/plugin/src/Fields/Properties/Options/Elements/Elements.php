<?php

namespace Solspace\Freeform\Fields\Properties\Options\Elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\ElementSourceTypeInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;

class Elements implements OptionsConfigurationInterface
{
    private ?ElementSourceTypeInterface $configuration;

    private string $typeClass;

    private array $properties;

    public function __construct(array $config = [], PropertyProvider $propertyProvider)
    {
        $this->typeClass = $config['typeClass'] ?? '';
        $this->properties = $config['properties'] ?? [];

        if ($this->typeClass) {
            $this->configuration = new $this->typeClass();
            $propertyProvider->setObjectProperties($this->configuration, $this->properties);
        }
    }

    public function getSource(): string
    {
        return self::SOURCE_ELEMENTS;
    }

    public function getTypeClass(): string
    {
        return $this->typeClass;
    }

    public function getOptions(): OptionCollection
    {
        return $this->configuration->generateOptions();
    }

    public function toArray(): array
    {
        return [
            'source' => $this->getSource(),
            'typeClass' => $this->typeClass,
            'properties' => (object) $this->properties,
        ];
    }
}
