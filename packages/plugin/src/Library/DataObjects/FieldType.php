<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\DataObjects\FieldType\Property;
use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\InvalidFieldTypeException;

class FieldType implements \JsonSerializable
{
    private string $name = '';

    private string $typeShorthand = '';

    private ?string $icon = null;

    private bool $isStorable = false;

    private ?PropertyCollection $properties = null;

    public function __construct(private string $className)
    {
        $reflection = new \ReflectionClass($className);
        if (!$reflection->implementsInterface(FieldInterface::class)) {
            return null;
        }

        /** @var Type $type */
        $typeAttribute = $reflection->getAttributes(Type::class)[0] ?? null;
        if (!$typeAttribute) {
            throw new InvalidFieldTypeException("Field type definition invalid for '{$className}'");
        }

        $type = $typeAttribute->newInstance();

        $this->typeShorthand = $type->typeShorthand;
        $this->name = $type->name;
        $this->icon = $type->iconPath;
        $this->isStorable = !$reflection->implementsInterface(NoStorageInterface::class);
        $this->properties = new PropertyCollection();

        $this->parseProperties($reflection);
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getTypeShorthand(): string
    {
        return $this->typeShorthand;
    }

    public function getIcon(): string
    {
        return $this->icon;
    }

    public function isStorable(): bool
    {
        return $this->isStorable;
    }

    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->typeShorthand,
            'class' => $this->className,
            'icon' => $this->icon,
            'storable' => $this->isStorable(),
            'properties' => $this->properties,
        ];
    }

    private function parseProperties(\ReflectionClass $reflection)
    {
        $properties = $reflection->getProperties();
        foreach ($properties as $property) {
            /** @var EditableProperty $attribute */
            $attr = $property->getAttributes(EditableProperty::class)[0] ?? null;
            if (!$attr) {
                continue;
            }

            $attribute = $attr->newInstance();

            $prop = new Property();
            $prop->type = $attribute->type ?? $property->getType()->getName();
            $prop->handle = $property->getName();
            $prop->label = $attribute->label;
            $prop->instructions = $attribute->instructions;
            $prop->placeholder = $attribute->placeholder;
            $prop->defaultValue = $attribute->defaultValue;

            $this->properties->add($prop);
        }
    }
}
