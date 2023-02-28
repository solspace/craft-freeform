<?php

namespace Solspace\Freeform\Library\DataObjects\Integrations;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

class Integration
{
    public int $id;
    public string $name;
    public string $handle;
    public string $type;
    public ?string $icon;
    public PropertyCollection $properties;
}
