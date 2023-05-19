<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\TabularData;

class ColumnConfiguration
{
    public const TYPE_TEXT = 'text';
    public const TYPE_SELECT = 'select';

    public function __construct(
        public string $key,
        public string $label,
        public ?string $type,
    ) {
        if (null === $type) {
            $this->type = self::TYPE_TEXT;
        }
    }
}
