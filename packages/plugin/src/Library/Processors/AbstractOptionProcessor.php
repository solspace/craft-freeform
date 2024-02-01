<?php

namespace Solspace\Freeform\Library\Processors;

use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use yii\di\Container;

abstract class AbstractOptionProcessor
{
    protected function processPropertyValue(\ReflectionClass $reflection, object $object, string $key, mixed $value): void
    {
        $property = $reflection->getProperty($key);
        if (!$property) {
            return;
        }

        $property->setAccessible(true);

        $originalValue = $value;

        $transformer = AttributeHelper::findAttribute($property, ValueTransformer::class);
        if ($transformer instanceof ValueTransformer) {
            $instance = $this->getContainer()->get($transformer->className);
            if ($instance) {
                $value = $instance->transform($value);
            }
        }

        if ($value instanceof Attributes) {
            $property->getValue($object)->merge($originalValue);

            return;
        }

        if ('value' === $key) {
            $defaultValueProperty = $reflection->getProperty('defaultValue');
            if ($defaultValueProperty) {
                $defaultValueProperty->setAccessible(true);
                $defaultValueProperty->setValue($object, $value);
                $defaultValueProperty->setAccessible(false);
            }
        }

        $property->setValue($object, $value);
        $property->setAccessible(false);
    }

    protected function getContainer(): Container
    {
        return \Craft::$container;
    }
}
