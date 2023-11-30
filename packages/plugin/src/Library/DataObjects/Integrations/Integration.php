<?php

namespace Solspace\Freeform\Library\DataObjects\Integrations;

use Solspace\Freeform\Attributes\Property\PropertyCollection;

class Integration
{
    public int $id;
    public string $uid;
    public string $name;
    public string $handle;
    public bool $enabled;
    public string $type;
    public string $shortName;
    public ?string $icon;
    public PropertyCollection $properties;
}
