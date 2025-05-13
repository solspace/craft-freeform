<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Implementations\Toolbar\ToolbarConfigurationInterface;
use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Wysiwyg extends Property implements ToolbarInterface
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
        public ?bool $toggleEditor = false,
        public array|bool|string|ToolbarConfigurationInterface $toolbar = false,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width, $disabled, $menu, $statusbar, $toggleEditor, $toolbar);
    }
}
