<?php

namespace Solspace\Freeform\Attributes\Field;

use Attribute;

#[Attribute(Attribute::TARGET_PROPERTY)]
class EditableProperty
{
    public function __construct(
        public ?string $type = null,
        public ?string $label = null,
        public ?string $instructions = null,
        public ?string $category = null,
        public ?int $order = null,
        public mixed $defaultValue = null,
        public ?string $placeholder = null,
        public ?array $options = null,
        public ?array $visibilityFilters = null,
    ) {
    }
}
