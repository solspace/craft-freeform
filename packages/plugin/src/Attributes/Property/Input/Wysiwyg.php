<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Wysiwyg extends Property
{
    public const BOLD = 'bold';
    public const ITALIC = 'italic';
    public const UNDERLINE = 'underline';
    public const STRIKETHROUGH = 'strikethrough';
    public const LINK = 'link';
    public const HEADING_1 = 'heading1';
    public const HEADING_2 = 'heading2';
    public const PARAGRAPH = 'paragraph';
    public const ORDERED_LIST = 'olist';
    public const UNORDERED_LIST = 'ulist';
    public const BLOCKQUOTE = 'quote';
    public const CODE = 'code';
    public const HORIZONTAL_RULE = 'horizontalRule';
    public const IMAGE = 'image';
    public const FONT_SIZE = 'fontSize';
    public const CLEAR_FORMATTING = 'clearFormatting';
    public const CLEAR_UNDO = 'undo';
    public const CLEAR_REDO = 'redo';

    public ?string $type = 'wysiwyg';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        ?bool $disabled = null,
        public ?array $actions = [],
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width, $disabled);
    }
}
