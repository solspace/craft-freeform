<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

class OptionCollection implements CustomNormalizerInterface, \IteratorAggregate
{
    private array $options = [];

    public function __construct(
        private ?string $label = null
    ) {
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function addCollection(self $collection): self
    {
        $this->options[] = $collection;

        return $this;
    }

    public function add(string $value, string $label, bool $checked = false): self
    {
        $this->options[] = new Option(
            $value,
            $label,
            $checked
        );

        return $this;
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function normalize(): array
    {
        return $this->toArray();
    }

    public function toArray(self $optionCollection = null): array
    {
        $options = [];

        if (!$optionCollection) {
            $optionCollection = $this;
        }

        foreach ($optionCollection->getOptions() as $item) {
            if ($item instanceof self) {
                $options[] = [
                    'label' => $item->getLabel(),
                    'children' => $this->toArray($item),
                ];
            }

            if ($item instanceof Option) {
                $options[] = [
                    'value' => $item->getValue(),
                    'label' => $item->getLabel(),
                    'checked' => $item->isChecked(),
                ];
            }
        }

        return $options;
    }

    public function toTwigArray(self $optionCollection = null): array
    {
        $options = [];

        if (!$optionCollection) {
            $optionCollection = $this;
        }

        foreach ($optionCollection->getOptions() as $item) {
            if ($item instanceof self) {
                $options[] = ['optgroup' => $item->getLabel()];
                $options = array_merge($options, $this->toTwigArray($item));

                continue;
            }

            if ($item instanceof Option) {
                $options[] = [
                    'value' => $item->getValue(),
                    'label' => $item->getLabel(),
                    'checked' => $item->isChecked(),
                ];
            }
        }

        return $options;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->options);
    }
}
