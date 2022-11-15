<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Attributes\Field\Section;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;
use Stringy\Stringy;

class AttributeProvider
{
    private array $attributesByType;

    public function getEditableProperties(string $class): PropertyCollection
    {
        $reflection = $this->getReflection($class);
        $collection = new PropertyCollection();

        $properties = $reflection->getProperties();
        foreach ($properties as $property) {
            /** @var EditableProperty $attribute */
            $attr = $property->getAttributes(EditableProperty::class)[0] ?? null;
            if (!$attr) {
                continue;
            }

            $section = $property->getAttributes(Section::class)[0] ?? null;
            $section = $section?->newInstance();

            /** @var Section $section */
            $fallbackLabel = Stringy::create($property->getName())
                ->underscored()
                ->replace('_', ' ')
                ->toTitleCase()
            ;

            $attribute = $attr->newInstance();

            $prop = new Property();
            $prop->type = $attribute->type ?? $property->getType()->getName();
            $prop->handle = $property->getName();
            $prop->label = $attribute->label ?? $fallbackLabel;
            $prop->instructions = $attribute->instructions;
            $prop->placeholder = $attribute->placeholder;
            $prop->section = $section?->handle;
            $prop->options = $attribute->options ?? [];
            $prop->value = $property->getDefaultValue() ?? $attribute->value;
            $prop->order = $attribute->order ?? $collection->getNextOrder();
            $prop->flags = $attribute->flags;
            $prop->middleware = $attribute->middleware;
            $prop->tab = $attribute->tab;

            $collection->add($prop);
        }

        return $collection;
    }

    public function getReflection(string $class): \ReflectionClass
    {
        return new \ReflectionClass($class);
    }
}
