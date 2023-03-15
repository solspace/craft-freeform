<?php

namespace Solspace\Freeform\Bundles\Attributes\Property;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionFetcherInterface;
use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Library\DataObjects\FieldType\Property as PropertyDTO;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;
use Stringy\Stringy;
use yii\di\Container;

class PropertyProvider
{
    public function __construct(private Container $container)
    {
    }

    public function getEditableProperties(string $class, mixed $referenceObject = null): PropertyCollection
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

            /** @var Property $attribute */
            $attribute = $attr->newInstance();

            $options = $this->compileOptions($attribute);

            $value = $property->getDefaultValue() ?? $attribute->value;
            if ($referenceObject) {
                $value = $property->getValue($referenceObject);
            }

            $prop = new PropertyDTO();
            $prop->type = $attribute->type ?? $property->getType()->getName();
            $prop->handle = $property->getName();
            $prop->label = $attribute->label ?? $fallbackLabel;
            $prop->instructions = $attribute->instructions;
            $prop->placeholder = $attribute->placeholder;
            $prop->section = $section?->handle;
            $prop->options = $options?->getOptions();
            $prop->required = $attribute->required;
            $prop->value = $value;
            $prop->order = $attribute->order ?? $collection->getNextOrder();
            $prop->flags = $this->getFlags($property);
            $prop->middleware = $this->getMiddleware($property);
            $prop->visibilityFilters = $this->getVisibilityFilters($property);
            $prop->transformer = $attribute->transformer ? $this->container->get($attribute->transformer) : null;
            $prop->setValidators($this->getValidators($property));

            if ($prop->required) {
                $prop->addValidator(new Required());
            }

            $collection->add($prop);
        }

        return $collection;
    }

    public function getReflection(string $class): \ReflectionClass
    {
        return new \ReflectionClass($class);
    }

    private function compileOptions(Property $attribute): ?OptionCollection
    {
        $collection = new OptionCollection();
        $options = $attribute->options;

        if (null === $options) {
            return null;
        }

        if (\is_string($options)) {
            /** @var OptionFetcherInterface $class */
            $class = $this->container->get($options);

            return $class->fetchOptions($attribute);
        }

        foreach ($options as $key => $value) {
            $val = $value['value'] ?? $key;
            $label = $value['label'] ?? $value;

            $collection->add($val, $label);
        }

        return $collection;
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

    private function getValidators(\ReflectionProperty $property): array
    {
        $validators = [];

        $attributes = $property->getAttributes();
        foreach ($attributes as $attribute) {
            $attributeInstance = $attribute->newInstance();
            if ($attributeInstance instanceof PropertyValidatorInterface) {
                $validators[] = $attributeInstance;
            }
        }

        return $validators;
    }
}
