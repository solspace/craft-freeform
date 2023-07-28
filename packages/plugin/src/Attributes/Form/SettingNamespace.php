<?php

namespace Solspace\Freeform\Attributes\Form;

use Solspace\Freeform\Attributes\Property\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class SettingNamespace
{
    public array $sections = [];

    public function __construct(
        public string $label,
        array $sections = [],
        public ?string $handle = null,
        public ?int $order = null,
        public ?PropertyCollection $properties = null,
    ) {
    }
}
