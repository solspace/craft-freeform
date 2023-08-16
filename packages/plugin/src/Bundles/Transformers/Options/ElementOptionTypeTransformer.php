<?php

namespace Solspace\Freeform\Bundles\Transformers\Options;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\ElementSourceTypeInterface;

class ElementOptionTypeTransformer
{
    public function __construct(
        private PropertyProvider $propertyProvider,
    ) {
    }

    public function transform(ElementSourceTypeInterface $sourceType): object
    {
        $properties = $this->propertyProvider->getEditableProperties($sourceType);

        return (object) [
            'typeClass' => \get_class($sourceType),
            'label' => $sourceType->getElementName(),
            'properties' => $properties,
        ];
    }
}
