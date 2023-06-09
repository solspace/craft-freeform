<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Library\Serialization\Normalizers\CustomNormalizerInterface;

class OptionCollection implements CustomNormalizerInterface
{
    private array $options = [];

    public function addCollection(string $label, self $collection): self
    {
        $this->options[] = ['label' => $label, 'children' => $collection->normalize()];

        return $this;
    }

    public function add(string $value, string $label): self
    {
        $this->options[] = ['value' => $value, 'label' => $label];

        return $this;
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function normalize(): array
    {
        return $this->options;
    }
}
