<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Attributes\Field\Section;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\InvalidFieldTypeException;
use Stringy\Stringy;

class FieldType implements \JsonSerializable
{
    private string $name = '';

    private string $type = '';

    private ?string $icon = null;

    private array $implements = [];

    private ?PropertyCollection $properties = null;

    private \ReflectionClass $reflection;

    public function __construct(private string $typeClass)
    {
        $this->reflection = $reflection = new \ReflectionClass($typeClass);
        if (!$reflection->implementsInterface(FieldInterface::class)) {
            return null;
        }

        /** @var Type $type */
        $typeAttribute = $reflection->getAttributes(Type::class)[0] ?? null;
        if (!$typeAttribute) {
            throw new InvalidFieldTypeException("Field type definition invalid for '{$typeClass}'");
        }

        $type = $typeAttribute->newInstance();

        $this->type = $type->typeShorthand;
        $this->name = $type->name;
        $this->icon = file_get_contents($type->iconPath);
        $this->implements = $this->getImplementations();
        $this->properties = $this->getConfiguredProperties();
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getIcon(): string
    {
        return $this->icon;
    }

    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'typeClass' => $this->typeClass,
            'icon' => $this->icon,
            'implements' => $this->implements,
            'properties' => $this->properties,
        ];
    }

    private function getImplementations(): array
    {
        $reflection = $this->reflection;

        $excludedInterfaces = [
            FieldInterface::class,
            \JsonSerializable::class,
            \Stringable::class,
            ExtraFieldInterface::class,
            SingleValueInterface::class,
            MultipleValueInterface::class,
        ];

        return array_values(
            array_map(
                fn ($interface) => preg_replace('/Interface$/', '', $interface->getShortName()),
                array_filter(
                    $reflection->getInterfaces(),
                    fn ($interfaceReflection) => !\in_array($interfaceReflection->getName(), $excludedInterfaces, true)
                )
            )
        );
    }

    private function getConfiguredProperties(): PropertyCollection
    {
        $collection = new PropertyCollection();

        $properties = $this->reflection->getProperties();
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
            $prop->value = $property->getDefaultValue() ?? $attribute->value;
            $prop->order = $attribute->order ?? $collection->getNextOrder();
            $prop->flags = $attribute->flags;
            $prop->middleware = $attribute->middleware;

            $collection->add($prop);
        }

        return $collection;
    }
}
