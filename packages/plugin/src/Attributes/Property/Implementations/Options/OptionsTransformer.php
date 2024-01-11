<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Transformer;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Fields\Properties\Options\Elements\Elements;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfigurationInterface;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Predefined;

class OptionsTransformer extends Transformer
{
    public function __construct(private PropertyProvider $propertyProvider) {}

    public function transform($value): OptionsConfigurationInterface
    {
        $source = $value['source'] ?? null;

        return match ($source) {
            OptionsConfigurationInterface::SOURCE_ELEMENTS => new Elements($value, $this->propertyProvider),
            OptionsConfigurationInterface::SOURCE_PREDEFINED => new Predefined($value, $this->propertyProvider),
            default => new Custom($value),
        };
    }

    /**
     * @param OptionsConfigurationInterface $value
     */
    public function reverseTransform($value): array
    {
        if (!$value instanceof OptionsConfigurationInterface) {
            $value = new Custom();
        }

        return $value->toArray();
    }
}
