<?php

namespace Solspace\Freeform\Fields\Properties\Options\Custom;

use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;

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
                $option['checked'] ?? false,
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

    public function getOptions(): OptionCollection
    {
        $collection = new OptionCollection();
        foreach ($this->options as $option) {
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
                    'checked' => $option->isChecked(),
                ],
                $this->options
            ),
        ];
    }
}
