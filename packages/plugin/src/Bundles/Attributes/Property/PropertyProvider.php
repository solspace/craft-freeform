<?php

namespace Solspace\Freeform\Bundles\Attributes\Property;

use Carbon\Carbon;
use craft\helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Implementations\TabularData\TabularDataConfiguration;
use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;
use Solspace\Freeform\Attributes\Property\Input\DatePicker;
use Solspace\Freeform\Attributes\Property\Input\Field;
use Solspace\Freeform\Attributes\Property\Input\OptionsInterface;
use Solspace\Freeform\Attributes\Property\Input\Table;
use Solspace\Freeform\Attributes\Property\Input\TabularData;
use Solspace\Freeform\Attributes\Property\Input\ToolbarInterface;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Lock;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use yii\di\Container;

/**
 * @template T of object
 */
class PropertyProvider
{
    public function __construct(
        private ImplementationProvider $implementationProvider,
        private DefaultsProvider $defaultsProvider,
        private LimitedUserChecker $checker,
    ) {}

    public function setObjectProperties(
        object $object,
        array $properties,
        ?callable $valueUpdateCallback = null,
        ?Form $form = null
    ): void {
        $editableProperties = $this->getEditableProperties($object);

        $propertyValueStack = $properties;
        foreach ($editableProperties as $property) {
            if (!\array_key_exists($property->handle, $propertyValueStack)) {
                $propertyValueStack[$property->handle] = null;
            }
        }

        foreach ($propertyValueStack as $key => $value) {
            $editableProperty = $editableProperties->get($key);

            if ($editableProperty && $editableProperty->transformer instanceof TransformerInterface) {
                $value = $editableProperty->transformer->transform($value, $form);
            }

            if ($valueUpdateCallback) {
                $value = $valueUpdateCallback($value, $editableProperty);
            }

            $this->setObjectValue($object, $key, $value);
        }
    }

    public function setObjectValue(object $object, string $key, mixed $value): void
    {
        try {
            $reflectionProperty = new \ReflectionProperty($object, $key);
        } catch (\ReflectionException) {
            return;
        }

        if (null === $value && !$reflectionProperty->getType()?->allowsNull()) {
            return;
        }

        $accessible = $reflectionProperty->isPublic();

        $reflectionProperty->setAccessible(true);

        if ('' === $value && $reflectionProperty->getType()?->allowsNull()) {
            $value = null;
        }

        try {
            $reflectionProperty->setValue($object, $value);
        } catch (\TypeError) {
        }

        if (!$accessible) {
            $reflectionProperty->setAccessible(false);
        }
    }

    public function getEditableProperties(object|string $object, ?object $context = null): PropertyCollection
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

            $this->processToolbarConfigurations($attribute);
            $this->processOptions($attribute);
            $this->processTableOptions($attribute);
            $this->processTabularDataConfiguration($attribute);
            $this->processImplementations($attribute);
            $this->processTransformer($property, $attribute);
            $this->processValueGenerator($property, $attribute);
            $this->processEditions($property, $attribute);
            $this->processFlags($property, $attribute);
            $this->processValidators($property, $attribute);
            $this->processMiddleware($property, $attribute);
            $this->processVisibilityFilters($property, $attribute);
            $this->processDelimiters($property, $attribute);
            $this->processDateProperties($attribute);
            $this->processLimitations($property, $attribute);
            $this->processMessages($property, $attribute);

            $this->processValue($property, $attribute, $referenceObject, $context);

            /** @var Section $section */
            $fallbackLabel = StringHelper::dasherize($property->getName());
            $fallbackLabel = StringHelper::replace($fallbackLabel, '-', ' ');
            $fallbackLabel = StringHelper::toTitleCase($fallbackLabel);

            $attribute->section = $section?->handle;
            $attribute->type = $this->processType($property, $attribute);
            $attribute->handle = $property->getName();
            $attribute->label ??= $fallbackLabel;
            $attribute->order ??= $collection->getNextOrder();
            $attribute->translatable = (bool) AttributeHelper::findAttribute($property, Translatable::class);

            if ($attribute->placeholder) {
                $attribute->placeholder = Freeform::t($attribute->placeholder);
            }

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

    protected function getPluginEdition(): EditionHelper
    {
        return Freeform::getInstance()->edition();
    }

    private function processToolbarConfigurations(Property $attribute): void
    {
        if (!$attribute instanceof ToolbarInterface) {
            return;
        }

        $toolbar = $attribute->getToolbar();

        if (\is_string($toolbar)) {
            /** @var ToolbarConfigurationInterface $class */
            $class = $this->getContainer()->get($toolbar);
            if ($class instanceof ToolbarConfigurationInterface) {
                $attribute->setToolbar($class->fetchComponents($attribute));
            } else {
                $attribute->setToolbar(false);
            }

            return;
        }

        $attribute->setToolbar($toolbar);
    }

    private function processOptions(Property $attribute): void
    {
        if (!$attribute instanceof OptionsInterface) {
            return;
        }

        $attribute->options = $this->resolveOptions($attribute->options, $attribute);
    }

    private function processTableOptions(Property $attribute): void
    {
        if (!$attribute instanceof Table) {
            return;
        }

        $attribute->assetSourceOptions = $this->resolveOptions($attribute->assetSourceOptions, $attribute);
        $attribute->fileKindsOptions = $this->resolveOptions($attribute->fileKindsOptions, $attribute);
    }

    private function resolveOptions(array|OptionCollection|string|null $options, Property $attribute): OptionCollection
    {
        $collection = new OptionCollection();
        if (null === $options) {
            return $collection;
        }

        if ($options instanceof OptionCollection) {
            return $options;
        }

        if (\is_string($options)) {
            /** @var OptionsGeneratorInterface $class */
            $class = $this->getContainer()->get($options);

            if ($class instanceof OptionsGeneratorInterface) {
                return $class->fetchOptions($attribute);
            }

            return $collection;
        }

        foreach ($options as $key => $value) {
            $val = $value['value'] ?? $key;
            $label = Freeform::t($value['label'] ?? $value);

            $collection->add($val, $label);
        }

        return $collection;
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
                $item['type'] ?? null,
                $item['translatable'] ?? false,
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
        $transformer = $this->getContainer()->get($transformerAttribute->className);
        $attribute->transformer = $transformer;
    }

    private function processValue(\ReflectionProperty $property, Property $attribute, $referenceObject, ?object $context): void
    {
        $hasDefaultValue = $this->processDefaultValue($property, $attribute);

        $value = $attribute->value ?? $property->getDefaultValue();
        if (!$hasDefaultValue && null === $referenceObject && $attribute->valueGenerator) {
            $value = $attribute->valueGenerator->generateValue($referenceObject, $context);
        }

        if ($referenceObject && $property->isInitialized($referenceObject)) {
            $value = $property->getValue($referenceObject);
        }

        if ($attribute->transformer) {
            $value = $attribute->transformer->reverseTransform($value);
        }

        $attribute->value = $value;
    }

    private function processDefaultValue(\ReflectionProperty $property, Property $attribute): bool
    {
        $defaultValue = AttributeHelper::findAttribute($property, DefaultValue::class);
        if (!$defaultValue) {
            $lock = AttributeHelper::findAttribute($property, Lock::class);
            if ($lock) {
                $attribute->disabled = !$this->defaultsProvider->isLocked($lock->path);
            }

            return false;
        }

        $isLocked = $this->defaultsProvider->isLocked($defaultValue->path);
        if ($isLocked) {
            $attribute->disabled = true;
        }

        $attribute->value = $this->defaultsProvider->getValue($defaultValue->path);

        return true;
    }

    private function processValueGenerator(\ReflectionProperty $property, Property $attribute): void
    {
        $valueGeneratorAttribute = AttributeHelper::findAttribute($property, ValueGenerator::class);
        if (!$valueGeneratorAttribute) {
            return;
        }

        /** @var ValueGeneratorInterface $valueGenerator */
        $valueGenerator = $this->getContainer()->get($valueGeneratorAttribute->className);
        $attribute->valueGenerator = $valueGenerator;
    }

    private function processEditions(\ReflectionProperty $property, Property $attribute): void
    {
        $edition = AttributeHelper::findAttribute($property, Edition::class);
        $attribute->edition = $edition?->name ?? Edition::EXPRESS;
    }

    private function processFlags(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->flags = AttributeHelper::findAttributes($property, Flag::class);
    }

    private function processMessages(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->messages = AttributeHelper::findAttributes($property, Message::class);
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

    private function processDelimiters(\ReflectionProperty $property, Property $attribute): void
    {
        $attribute->delimiter = AttributeHelper::findAttribute($property, Delimiter::class);
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

    private function processLimitations(\ReflectionProperty $property, Property $attribute): void
    {
        $limitation = AttributeHelper::findAttribute($property, Limitation::class);
        if (!$limitation) {
            return;
        }

        $attribute->visible = $this->checker->can($limitation->expression, $limitation->includes);
    }

    private function getContainer(): Container
    {
        return \Craft::$container;
    }
}
