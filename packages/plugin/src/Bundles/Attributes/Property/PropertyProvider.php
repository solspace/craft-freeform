<?php

namespace Solspace\Freeform\Bundles\Attributes\Property;

use Carbon\Carbon;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Implementations\TabularData\TabularDataConfiguration;
use Solspace\Freeform\Attributes\Property\Input\DatePicker;
use Solspace\Freeform\Attributes\Property\Input\Field;
use Solspace\Freeform\Attributes\Property\Input\OptionsInterface;
use Solspace\Freeform\Attributes\Property\Input\TabularData;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use Stringy\Stringy;
use yii\di\Container;

/**
 * @template T of object
 */
class PropertyProvider
{
    public function __construct(
        private Container $container,
        private ImplementationProvider $implementationProvider,
        private DefaultsProvider $defaultsProvider,
    ) {}

    public function setObjectProperties(
        object $object,
        array $properties,
        ?callable $valueUpdateCallback = null
    ): void {
        $reflection = new \ReflectionClass($object);
        $editableProperties = $this->getEditableProperties($object);

        foreach ($properties as $key => $value) {
            $editableProperty = $editableProperties->get($key);
            if ($editableProperty && $editableProperty->transformer instanceof TransformerInterface) {
                $value = $editableProperty->transformer->transform($value);
            }

            try {
                $reflectionProperty = $reflection->getProperty($key);
            } catch (\ReflectionException $e) {
                continue;
            }

            if ($valueUpdateCallback) {
                $value = $valueUpdateCallback($value, $editableProperty);
            }

            $accessible = $reflectionProperty->isPublic();

            $reflectionProperty->setAccessible(true);

            if ('' === $value && $reflectionProperty->getType()?->allowsNull()) {
                $value = null;
            }

            $reflectionProperty->setValue($object, $value);

            if (!$accessible) {
                $reflectionProperty->setAccessible(false);
            }
        }
    }

    public function getEditableProperties(object|string $object): PropertyCollection
    {
        $class = \is_string($object) ? $object : $object::class;
        $referenceObject = \is_string($object) ? null : $object;

        $reflection = $this->getReflection($class);
        $collection = new PropertyCollection();

        $properties = $reflection->getProperties();
        foreach ($properties as $property) {
            $accessible = $property->isPublic();
            $property->setAccessible(true);

            $attribute = AttributeHelper::findAttribute($property, Property::class);
            $section = AttributeHelper::findAttribute($property, Section::class);
            if (!$attribute) {
                continue;
            }

            $this->processOptions($attribute);
            $this->processTabularDataConfiguration($attribute);
            $this->processImplementations($attribute);
            $this->processTransformer($property, $attribute);
            $this->processValueGenerator($property, $attribute);
            $this->processEditions($property, $attribute);
            $this->processFlags($property, $attribute);
            $this->processValidators($property, $attribute);
            $this->processMiddleware($property, $attribute);
            $this->processVisibilityFilters($property, $attribute);
            $this->processDateProperties($attribute);

            $this->processValue($property, $attribute, $referenceObject);

            /** @var Section $section */
            $fallbackLabel = Stringy::create($property->getName())
                ->underscored()
                ->replace('_', ' ')
                ->toTitleCase()
            ;

            $attribute->section = $section?->handle;
            $attribute->type = $this->processType($property, $attribute);
            $attribute->handle = $property->getName();
            $attribute->label ??= $fallbackLabel;
            $attribute->order ??= $collection->getNextOrder();

            $collection->add($attribute);

            if (!$accessible) {
                $property->setAccessible(false);
            }
        }

        return $collection;
    }

    public function getReflection(string $class): \ReflectionClass
    {
        return new \ReflectionClass($class);
    }

    public function processType(\ReflectionProperty $property, Property $attribute): string
    {
        if (!$attribute->matchesEdition($this->getPluginEdition())) {
            return 'hidden';
        }

        if ($attribute->type) {
            return $attribute->type;
        }

        $type = $property->getType();
        if ($type->isBuiltin()) {
            return $type->getName();
        }

        $class = new \ReflectionClass($type->getName());

        return lcfirst($class->getShortName());
    }

    protected function getPluginEdition(): string
    {
        return Freeform::getInstance()->edition;
    }

    private function processOptions(Property $attribute): void
    {
        if (!$attribute instanceof OptionsInterface) {
            return;
        }

        $collection = new OptionCollection();
        $options = $attribute->options;

        if (null === $options) {
            return;
        }

        if (\is_string($options)) {
            /** @var OptionsGeneratorInterface $class */
            $class = $this->container->get($options);
            if ($class instanceof OptionsGeneratorInterface) {
                $attribute->options = $class->fetchOptions($attribute);
            } else {
                $attribute->options = $collection;
            }

            return;
        }

        foreach ($options as $key => $value) {
            $val = $value['value'] ?? $key;
            $label = $value['label'] ?? $value;

            $collection->add($val, $label);
        }

        $attribute->options = $collection;
    }

    private function processTabularDataConfiguration(Property $attribute): void
    {
        if (!$attribute instanceof TabularData) {
            return;
        }

        $configuration = new TabularDataConfiguration();
        $config = $attribute->configuration;

        if (null === $config || $config instanceof TabularDataConfiguration) {
            return;
        }

        foreach ($config as $item) {
            $configuration->add(
                $item['key'],
                $item['label'] ?? $item['key'],
                $item['type'] ?? null
            );
        }

        $attribute->configuration = $configuration;
    }

    private function processImplementations(Property $attribute): void
    {
        if (!$attribute instanceof Field) {
            return;
        }

        $implementations = $attribute->implements;
        if (empty($implementations)) {
            $attribute->implements = null;

            return;
        }

        $attribute->implements = $this->implementationProvider->getFromArray($attribute->implements);
    }

    private function processTransformer(\ReflectionProperty $property, Property $attribute): void
    {
        $transformerAttribute = AttributeHelper::findAttribute($property, ValueTransformer::class);
        if (!$transformerAttribute) {
            return;
        }

        /** @var TransformerInterface $transformer */
        $transformer = $this->container->get($transformerAttribute->className);
        $attribute->transformer = $transformer;
    }

    private function processValue(\ReflectionProperty $property, Property $attribute, $referenceObject): void
    {
        $this->processDefaultValue($property, $attribute);

        $value = $attribute->value ?? $property->getDefaultValue();
        if (null === $referenceObject && $attribute->valueGenerator) {
            $value = $attribute->valueGenerator->generateValue($referenceObject);
        }

        if ($referenceObject && $property->isInitialized($referenceObject)) {
            $value = $property->getValue($referenceObject);
        }

        if ($attribute->transformer) {
            $value = $attribute->transformer->reverseTransform($value);
        }

        $attribute->value = $value;
    }

    private function processDefaultValue(\ReflectionProperty $property, Property $attribute): void
    {
        $defaultValue = AttributeHelper::findAttribute($property, DefaultValue::class);
        if (!$defaultValue) {
            return;
        }

        $isLocked = $this->defaultsProvider->isLocked($defaultValue->path);
        if ($isLocked) {
            $attribute->disabled = true;
        }

        $attribute->value = $this->defaultsProvider->getValue($defaultValue->path);
    }

    private function processValueGenerator(\ReflectionProperty $property, Property $attribute): void
    {
        $valueGeneratorAttribute = AttributeHelper::findAttribute($property, ValueGenerator::class);
        if (!$valueGeneratorAttribute) {
            return;
        }

        /** @var ValueGeneratorInterface $valueGenerator */
        $valueGenerator = $this->container->get($valueGeneratorAttribute->className);
        $attribute->valueGenerator = $valueGenerator;
    }

    private function processEditions(\ReflectionProperty $property, Property $attribute): void
    {
        $editions = AttributeHelper::findAttributes($property, Edition::class);
        foreach ($editions as $edition) {
            $attribute->editions[] = $edition->name;
        }
    }

    private function processFlags(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->flags = AttributeHelper::findAttributes($property, Flag::class);
    }

    private function processValidators(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->validators = AttributeHelper::findAttributes($property, PropertyValidatorInterface::class);
        foreach ($attribute->validators as $validator) {
            if ($validator instanceof Required) {
                $attribute->required = true;

                break;
            }
        }
    }

    private function processMiddleware(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->middleware = AttributeHelper::findAttributes($property, Middleware::class);
    }

    private function processVisibilityFilters(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->visibilityFilters = AttributeHelper::findAttributes($property, VisibilityFilter::class);
    }

    private function processDateProperties(Property $attribute): void
    {
        if (!$attribute instanceof DatePicker) {
            return;
        }

        if ($attribute->minDate) {
            $attribute->minDate = (new Carbon($attribute->minDate))->toIso8601String();
        }

        if ($attribute->maxDate) {
            $attribute->maxDate = (new Carbon($attribute->maxDate))->toIso8601String();
        }
    }
}
