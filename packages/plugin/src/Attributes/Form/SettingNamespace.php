<?php

namespace Solspace\Freeform\Attributes\Form;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class SettingNamespace
{
    public array $sections = [];

    public function __construct(
        public string $label,
        array $sections = [],
        public ?string $handle = null,
        public ?string $icon = null,
        public ?PropertyCollection $properties = null,
    ) {
    }
}
