<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class FieldTransformer
{
    public function __construct(
        private PropertyProvider $propertyProvider,
        private PropertyAccessor $propertyAccess
    ) {
    }

    public function transform(FieldInterface $field): object
    {
        $typeClass = \get_class($field);
        $editableProperties = $this->propertyProvider->getEditableProperties($typeClass);

        $properties = [];
        foreach ($editableProperties as $property) {
            $value = $this->propertyAccess->getValue($field, $property->handle);
            if ($property->transformer) {
                $value = $property->transformer->reverseTransform($value);
            }

            $properties[$property->handle] = $value;
        }

        return (object) [
            'uid' => $field->getUid(),
            'label' => $field->getLabel(),
            'typeClass' => $typeClass,
            'properties' => $properties,
        ];
    }
}
