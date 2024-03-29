<?php

namespace Solspace\Freeform\Attributes\Notification;

use Solspace\Freeform\Attributes\Property\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Type
{
    public string $className;
    private PropertyCollection $properties;

    public function __construct(
        public string $name,
        public string $newInstanceName,
        public ?int $order = null,
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
