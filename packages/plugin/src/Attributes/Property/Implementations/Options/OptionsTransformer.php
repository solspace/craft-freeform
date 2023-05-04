<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Fields\Properties\Options\Custom\CustomOptions;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;

class OptionsTransformer extends Transformer
{
    public const SOURCE_CUSTOM_OPTIONS = 'customOptions';

    public const DEFAULT_VALUE = [
        'source' => self::SOURCE_CUSTOM_OPTIONS,
        'useCustomValues' => false,
        'options' => [],
    ];

    public function transform($value): OptionsCollection
    {
        $source = $value['source'] ?? self::SOURCE_CUSTOM_OPTIONS;

        return match ($source) {
            default => new CustomOptions($value['options'] ?? [], $value['useCustomValues'] ?? false),
        };
    }

    /**
     * @param OptionsCollection $value
     */
    public function reverseTransform($value): array
    {
        if ($value instanceof OptionsCollection) {
            return $value->jsonSerialize();
        }

        return [];
    }
}
