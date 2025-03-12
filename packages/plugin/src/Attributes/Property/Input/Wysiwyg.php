<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Wysiwyg extends Property
{
    public ?string $type = 'wysiwyg';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        ?bool $disabled = null,
        public ?bool $menu = false,
        public ?bool $statusbar = false,
        public array|bool $toolbar = false,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width, $disabled);
    }
}
