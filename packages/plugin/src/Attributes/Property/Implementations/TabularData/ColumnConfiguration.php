<?php

namespace Solspace\Freeform\Attributes\Property\Implementations\TabularData;

class ColumnConfiguration
{
    public const TYPE_TEXT = 'text';
    public const TYPE_SELECT = 'select';
    public const TYPE_TEXTAREA = 'textarea';
    public const TYPE_ASSET = 'asset';
    public const TYPE_JSON = 'json';

    public function __construct(
        public string $key,
        public string $label,
        public ?string $type,
        public ?bool $translatable = false,
    ) {
        if (null === $type) {
            $this->type = self::TYPE_TEXT;
        }
    }
}
