<?php

namespace Solspace\Freeform\Attributes\Notification;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public string $class;
    private PropertyCollection $properties;

    public function __construct(
        public string $name,
        public string $newInstanceName,
        public ?string $icon = null,
    ) {
        $this->properties = new PropertyCollection();
    }

    public function setProperties(PropertyCollection $properties): void
    {
        $this->properties = $properties;
    }

    public function getProperties(): PropertyCollection
    {
        return $this->properties;
    }
}
