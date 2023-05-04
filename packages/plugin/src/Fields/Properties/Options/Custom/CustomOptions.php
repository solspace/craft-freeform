<?php

namespace Solspace\Freeform\Fields\Properties\Options\Custom;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsTransformer;
use Solspace\Freeform\Fields\Properties\Options\Option;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;

class CustomOptions extends OptionsCollection
{
    public function __construct(array $options = [], private $useCustomValues = false)
    {
        foreach ($options as $option) {
            $this->add(
                $option['label'] ?? '',
                $option['value'] ?? '',
                $option['checked'] ?? false,
            );
        }
    }

    public function getUseCustomValues(): bool
    {
        return $this->useCustomValues;
    }

    public function jsonSerialize(): array
    {
        return [
            'source' => OptionsTransformer::SOURCE_CUSTOM_OPTIONS,
            'useCustomValues' => $this->useCustomValues,
            'options' => array_map(
                fn (Option $opt) => $opt->jsonSerialize(),
                $this->options
            ),
        ];
    }
}
