<?php

namespace Solspace\Freeform\Library\DataObjects;

use Solspace\Freeform\Attributes\Property\PropertyCollection;

class FieldType implements \JsonSerializable
{
    public string $name = '';
    public string $type = '';
    public string $typeClass = '';
    public bool $visible = true;
    public ?string $icon = null;
    public ?string $previewTemplate = null;
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
            'visible' => $this->visible,
            'icon' => $this->icon,
            'previewTemplate' => $this->previewTemplate,
            'implements' => $this->implements,
            'properties' => $this->properties,
        ];
    }
}
