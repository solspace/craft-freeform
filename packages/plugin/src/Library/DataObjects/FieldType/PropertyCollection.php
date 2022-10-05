<?php

namespace Solspace\Freeform\Library\DataObjects\FieldType;

class PropertyCollection implements \JsonSerializable
{
    private array $properties = [];

    public function add(Property ...$properties): self
    {
        foreach ($properties as $property) {
            $this->properties[] = $property;
        }

        return $this;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function jsonSerialize()
    {
        return $this->properties;
    }
}
