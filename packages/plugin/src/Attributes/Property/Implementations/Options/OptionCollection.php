<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

/**
 * @implements \IteratorAggregate<Option|OptionCollection>
 */
class OptionCollection implements CustomNormalizerInterface, \IteratorAggregate
{
    private array $options = [];

    public function __construct(
        private ?string $label = null
    ) {}

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function addCollection(self $collection): self
    {
        $this->options[] = $collection;

        return $this;
    }

    public function add(Option|string $value, string $label = '', ?int $atIndex = null): self
    {
        if ($value instanceof Option) {
            $option = $value;
        } else {
            $option = new Option($value, $label);
        }

        if (null !== $atIndex) {
            array_splice($this->options, $atIndex, 0, [$option]);
        } else {
            $this->options[] = $option;
        }

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
