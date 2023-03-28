<?php

namespace Solspace\Freeform\Attributes\Property\Traits;

use Symfony\Component\PropertyAccess\Exception\NoSuchPropertyException;

trait PropertyPopulateTrait
{
    public function updateProperties(array $properties = []): void
    {
        $reflection = new \ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            try {
                $propertyName = $property->getName();

                if (!isset($properties[$propertyName])) {
                    continue;
                }

                $value = $properties[$propertyName];
                $this->{$propertyName} = $value;
            } catch (NoSuchPropertyException $e) {
                // Pass along
            }
        }
    }
}
