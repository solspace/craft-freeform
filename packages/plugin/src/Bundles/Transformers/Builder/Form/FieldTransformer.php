<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\FieldInterface;

class FieldTransformer
{
    public function __construct(
        private PropertyProvider $propertyProvider,
    ) {
    }

    public function transform(FieldInterface $field): object
    {
        $typeClass = $field::class;
        $editableProperties = $this->propertyProvider->getEditableProperties($typeClass);

        $properties = [];
        foreach ($editableProperties as $property) {
            $reflectionProperty = new \ReflectionProperty($field, $property->handle);

            $isAccessible = $reflectionProperty->isPublic();
            if (!$isAccessible) {
                $reflectionProperty->setAccessible(true);
            }

            $value = $reflectionProperty->getValue($field);

            if (!$isAccessible) {
                $reflectionProperty->setAccessible(false);
            }

            if ($property->transformer) {
                $value = $property->transformer->reverseTransform($value);
            }

            $properties[$property->handle] = $value;
        }

        return (object) [
            'id' => $field->getId(),
            'uid' => $field->getUid(),
            'label' => $field->getLabel(),
            'rowUid' => $field->getRowUid(),
            'order' => $field->getOrder(),
            'typeClass' => $typeClass,
            'properties' => $properties,
        ];
    }
}
