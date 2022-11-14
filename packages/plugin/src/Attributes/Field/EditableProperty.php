<?php

namespace Solspace\Freeform\Attributes\Field;

use Attribute;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class EditableProperty
{
    public function __construct(
        public ?string $label = null,
        public ?string $type = null,
        public ?string $instructions = null,
        public ?string $category = null,
        public ?int $order = null,
        public mixed $value = null,
        public ?string $placeholder = null,
        public ?array $options = null,
        public ?array $flags = [],
        public ?array $visibilityFilters = null,
        public ?array $middleware = [],
        public ?string $tab = null,
    ) {
    }
}
