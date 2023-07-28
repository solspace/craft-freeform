<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Section
{
    public function __construct(
        public ?string $handle,
        public ?string $label = null,
        public ?string $icon = null,
        public ?int $order = null,
    ) {
    }
}
