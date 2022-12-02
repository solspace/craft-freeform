<?php

namespace Solspace\Freeform\Attributes\Field;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Property
{
    public function __construct(
        public ?string $label = null,
        public ?string $type = null,
        public ?string $instructions = null,
        public ?string $category = null,
        public ?int $order = null,
        public mixed $value = null,
        public ?string $placeholder = null,
        public ?string $section = null,
        public ?array $options = null,
        public ?string $tab = null,
        public ?string $group = null,
    ) {
    }
}
