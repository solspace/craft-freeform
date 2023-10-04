<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories;

use craft\helpers\StringHelper;
use Solspace\Freeform\Attributes\Defaults\EmptyValue;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Defaults\SetDefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\DefaultConfigInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\Helpers\AttributeHelper;

abstract class BaseCategory implements CategoryInterface, \IteratorAggregate, \JsonSerializable
{
    public function __construct(array $config = [])
    {
        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        foreach ($properties as $property) {
            if ($property->getType()->isBuiltin()) {
                continue;
            }

            $name = $property->getName();
            $class = $property->getType()->getName();

            if (is_a($class, CategoryInterface::class, true)) {
                $this->{$name} = new $class($config[$name] ?? []);
            }

            if (is_a($class, DefaultConfigInterface::class, true)) {
                $labelAttribute = AttributeHelper::findAttribute($property, Label::class);
                if ($labelAttribute) {
                    $label = $labelAttribute->label;
                } else {
                    $label = StringHelper::titleize(
                        implode(
                            ' ',
                            StringHelper::toWords($property->getName())
                        )
                    );
                }

                $defaultValue = '';
                $valueGeneratorAttribute = AttributeHelper::findAttribute($property, ValueGenerator::class);
                if ($valueGeneratorAttribute) {
                    $generator = \Craft::$container->get($valueGeneratorAttribute->className);
                    if ($generator instanceof ValueGeneratorInterface) {
                        $defaultValue = $generator->generateValue($this);
                    }
                } else {
                    $defaultValueAttribute = AttributeHelper::findAttribute($property, SetDefaultValue::class);
                    if ($defaultValueAttribute) {
                        $defaultValue = $defaultValueAttribute->value;
                    }
                }

                $value = $config[$name]['value'] ?? $defaultValue;
                if (is_a($class, BoolItem::class, true)) {
                    $value = (bool) $value;
                }

                $configuration = $config[$name] ?? [
                    'value' => $value,
                    'locked' => $config[$name]['locked'] ?? false,
                ];

                if (is_a($class, SelectItem::class, true)) {
                    $emptyValue = AttributeHelper::findAttribute($property, EmptyValue::class);
                    if ($emptyValue) {
                        $configuration['emptyValue'] = $emptyValue->label;
                    }

                    $optionsGenerator = AttributeHelper::findAttribute($property, OptionsGenerator::class);
                    if ($optionsGenerator) {
                        $generator = \Craft::$container->get($optionsGenerator->generator);
                        if ($generator instanceof OptionsGeneratorInterface) {
                            $configuration['optionsGenerator'] = $generator;
                        }
                    }
                }

                $this->{$property->getName()} = new $class($configuration);
                $this->{$property->getName()}->setLabel($label);
            }
        }
    }

    public function getIterator(): \ArrayIterator
    {
        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        $array = [];
        foreach ($properties as $property) {
            $array[$property->getName()] = $property->getValue($this);
        }

        return new \ArrayIterator($array);
    }

    public function jsonSerialize(): array
    {
        $returnArray = [];

        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        foreach ($properties as $property) {
            if ($property->getType()->isBuiltin()) {
                $returnArray[$property->getName()] = $property->getValue($this);

                continue;
            }

            $name = $property->getName();
            $class = $property->getType()->getName();

            if (is_a($class, CategoryInterface::class, true)) {
                $returnArray[$name] = $property->getValue($this)->jsonSerialize();

                continue;
            }

            if (is_a($class, DefaultConfigInterface::class, true)) {
                $value = $property->getValue($this);
                $returnArray[$name] = [
                    'locked' => $value->locked,
                    'value' => $value->value,
                ];
            }
        }

        return $returnArray;
    }
}
