<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<string>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class CodeEditor extends Property
{
    public ?string $type = 'codeEditor';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        public ?string $language = 'html',
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width);
    }
}
