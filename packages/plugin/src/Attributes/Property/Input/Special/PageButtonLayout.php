<?php

namespace Solspace\Freeform\Attributes\Property\Input\Special;

use Solspace\Freeform\Attributes\Property\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class PageButtonLayout extends Property
{
    public ?string $type = 'pageButtonLayout';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        public array $layouts = [],
        public array $elements = [],
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width);
    }
}
