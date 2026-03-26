<?php

namespace Solspace\Freeform\Attributes\Property\Input;

use Solspace\Freeform\Attributes\Property\Property;

/**
 * @extends Property<array>
 */
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class EntryPicker extends Property
{
    public ?string $type = 'entryPicker';

    public function __construct(
        ?string $label = null,
        ?string $instructions = null,
        ?int $order = null,
        mixed $value = null,
        ?string $placeholder = null,
        ?int $width = null,
        public ?string $actionLabel = null,
        public bool $multiSelect = true,
        public ?array $criteria = null,
        public ?int $limit = null,
        public bool $allSites = false,
    ) {
        parent::__construct($label, $instructions, $order, $value, $placeholder, $width);
    }
}
