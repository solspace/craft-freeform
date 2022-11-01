<?php

namespace Solspace\Freeform\Library\DataObjects;

class FieldPropertySection
{
    public function __construct(
        public string $handle,
        public string $label,
        public ?int $order = null,
    ) {
    }
}
