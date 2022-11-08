<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

class FieldType implements \JsonSerializable
{
    public string $name = '';

    public string $type = '';

    public string $typeClass = '';

    public ?string $icon = null;

    public array $implements = [];

    public ?PropertyCollection $properties;

    public function __construct()
    {
        $this->properties = new PropertyCollection();
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
}
