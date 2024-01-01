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
    public static function findAttributes(\ReflectionClass|\ReflectionProperty $reflection, string $className): array
    {
        $matches = [];

        $attributes = $reflection->getAttributes();
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
