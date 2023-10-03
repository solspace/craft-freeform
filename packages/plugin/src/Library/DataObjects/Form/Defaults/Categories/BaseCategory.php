<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories;

use craft\helpers\StringHelper;
use Solspace\Freeform\Attributes\Defaults\Label;
use Solspace\Freeform\Attributes\Defaults\OptionsGenerator;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\BoolItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\DefaultConfigInterface;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\Helpers\AttributeHelper;

abstract class BaseCategory implements CategoryInterface, \IteratorAggregate
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
                $label = $labelAttribute ? $labelAttribute->label : StringHelper::capitalizePersonalName($property->getName());

                $value = $config[$name]['value'] ?? '';
                if (is_a($class, BoolItem::class, true)) {
                    $value = (bool) $value;
                }

                $configuration = $config[$name] ?? [
                    'label' => $label,
                    'value' => $value,
                    'locked' => $config[$name]['locked'] ?? false,
                ];

                if (is_a($class, SelectItem::class, true)) {
                    $optionsGenerator = AttributeHelper::findAttribute($property, OptionsGenerator::class);
                    if ($optionsGenerator) {
                        $generator = \Craft::$container->get($optionsGenerator->generator);
                        if ($generator instanceof OptionsGeneratorInterface) {
                            $configuration['optionsGenerator'] = $generator;
                        }
                    }
                }

                $this->{$property->getName()} = new $class($configuration);
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
}
