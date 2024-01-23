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
    public static function findAttribute(\ReflectionClass|\ReflectionProperty $reflection, string $className): ?object
    {
        $attributes = $reflection->getAttributes();
        foreach ($attributes as $attribute) {
            if (ReflectionHelper::isInstanceOf($attribute->getName(), $className)) {
                return $attribute->newInstance();
            }
        }

        return null;
    }

    /**
     * @param class-string<T> $className
     *
     * @return T[]
     */
    public static function findAttributes(\ReflectionClass|\ReflectionProperty $reflection, string $className): array
    {
        $matches = [];

        $attributes = $reflection->getAttributes();
        foreach ($attributes as $attribute) {
            if (!ReflectionHelper::isInstanceOf($attribute->getName(), $className)) {
                continue;
            }

            $matches[] = $attribute->newInstance();
        }

        return $matches;
    }
}
