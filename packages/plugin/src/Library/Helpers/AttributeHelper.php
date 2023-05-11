<?php

namespace Solspace\Freeform\Library\Helpers;

/**
 * @template T of object
 */
class AttributeHelper
{
    /**
     * @param class-string<T> $className
     *
     * @return null|T
     */
    public static function findAttribute(\ReflectionProperty $property, string $className): ?object
    {
        $attributes = $property->getAttributes();
        foreach ($attributes as $attribute) {
            $instance = $attribute->newInstance();
            if ($instance instanceof $className) {
                return $instance;
            }
        }

        return null;
    }

    /**
     * @param class-string<T> $className
     *
     * @return T[]
     */
    public static function findAttributes(\ReflectionProperty $property, string $className): array
    {
        $matches = [];

        $attributes = $property->getAttributes();
        foreach ($attributes as $attribute) {
            /** @var T $instance */
            $instance = $attribute->newInstance();
            if ($instance instanceof $className) {
                $matches[] = $instance;
            }
        }

        return $matches;
    }
}
