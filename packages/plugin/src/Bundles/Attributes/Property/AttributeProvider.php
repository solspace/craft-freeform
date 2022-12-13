<?php

namespace Solspace\Freeform\Bundles\Attributes\Property;

class AttributeProvider
{
    public function getPropertyAttributes(string $class, string $attributeClass): array
    {
        $reflection = $this->getReflection($class);

        $properties = $reflection->getProperties();

        $collection = [];
        foreach ($properties as $property) {
            $attributes = $property->getAttributes($attributeClass);

            $collection[$property->getName()] = array_map(
                fn ($attr) => $attr->newInstance(),
                $attributes
            );
        }

        return $collection;
    }

    public function getSingletonPropertyAttributes(string $class, string $attributeClass): array
    {
        $collection = $this->getPropertyAttributes($class, $attributeClass);

        return array_map(
            fn ($item) => reset($item),
            $collection
        );
    }
}
