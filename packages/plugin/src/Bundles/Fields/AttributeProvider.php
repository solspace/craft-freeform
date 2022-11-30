<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Attributes\Field\Flag;
use Solspace\Freeform\Attributes\Field\Middleware;
use Solspace\Freeform\Attributes\Field\Property;
use Solspace\Freeform\Attributes\Field\Section;
use Solspace\Freeform\Attributes\Field\VisibilityFilter;
use Solspace\Freeform\Library\DataObjects\FieldType\Property as PropertyDTO;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;
use Stringy\Stringy;

class AttributeProvider
{
    public function getEditableProperties(string $class): PropertyCollection
    {
        $reflection = $this->getReflection($class);
        $collection = new PropertyCollection();

        $properties = $reflection->getProperties();
        foreach ($properties as $property) {
            $attr = $property->getAttributes(Property::class)[0] ?? null;
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

            $prop = new PropertyDTO();
            $prop->type = $attribute->type ?? $property->getType()->getName();
            $prop->handle = $property->getName();
            $prop->label = $attribute->label ?? $fallbackLabel;
            $prop->instructions = $attribute->instructions;
            $prop->placeholder = $attribute->placeholder;
            $prop->section = $section?->handle;
            $prop->options = $attribute->options ?? [];
            $prop->value = $property->getDefaultValue() ?? $attribute->value;
            $prop->order = $attribute->order ?? $collection->getNextOrder();
            $prop->flags = $this->getFlags($property);
            $prop->middleware = $this->getMiddleware($property);
            $prop->visibilityFilters = $this->getVisibilityFilters($property);
            $prop->tab = $attribute->tab;
            $prop->group = $attribute->group;

            $collection->add($prop);
        }

        return $collection;
    }

    public function getReflection(string $class): \ReflectionClass
    {
        return new \ReflectionClass($class);
    }

    private function getFlags(\ReflectionProperty $property): array
    {
        return array_map(
            fn ($attr) => $attr->getArguments()[0],
            $property->getAttributes(Flag::class)
        );
    }

    private function getVisibilityFilters(\ReflectionProperty $property): array
    {
        return array_map(
            fn ($attr) => $attr->getArguments()[0],
            $property->getAttributes(VisibilityFilter::class)
        );
    }

    private function getMiddleware(\ReflectionProperty $property): array
    {
        return array_map(
            fn ($attr) => $attr->getArguments(),
            $property->getAttributes(Middleware::class)
        );
    }
}
