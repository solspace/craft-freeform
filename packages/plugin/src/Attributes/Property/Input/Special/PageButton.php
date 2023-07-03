<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special;

use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class PageButton extends Property
{
    public ?string $type = 'pageButton';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        public ?bool $togglable = false,
        public ?bool $enabled = true,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder);
    }
}
