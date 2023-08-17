<?php

namespace Solspace\Freeform\Fields\Properties\Options;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;

abstract class OptionsConfiguration implements OptionsConfigurationInterface
{
    private ?OptionTypeProviderInterface $configuration;

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
