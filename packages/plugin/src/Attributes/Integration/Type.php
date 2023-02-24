<?php

namespace Solspace\Freeform\Attributes\Integration;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    private PropertyCollection $properties;

    public function __construct(
        public string $name,
        public string $iconPath,
    ) {
        $this->properties = new PropertyCollection();
    }

    public function __toString(): string
    {
        return $this->name;
    }

    public function setProperties(PropertyCollection $properties)
    {
        $this->properties = $properties;
    }

    public function getProperties(): PropertyCollection
    {
        return $this->properties;
    }
}
