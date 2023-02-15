<?php

namespace Solspace\Freeform\Attributes\Property;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Property
{
    public const TYPE_TABLE = 'table';
    public const TYPE_OPTIONS = 'options';
    public const TYPE_MIN_MAX = 'minMax';
    public const TYPE_SELECT = 'select';
    public const TYPE_TEXTAREA = 'textarea';
    public const TYPE_COLOR_PICKER = 'color-picker';
    public const TYPE_DATE_PICKER = 'date-picker';
    public const TYPE_TIME_PICKER = 'time-picker';
    public const TYPE_DATE_TIME_PICKER = 'datetime-picker';

    public function __construct(
        public ?string $label = null,
        public ?string $type = null,
        public ?string $instructions = null,
        public ?string $category = null,
        public ?int $order = null,
        public mixed $value = null,
        public ?string $transformer = null,
        public ?string $valueGenerator = null,
        public ?string $placeholder = null,
        public ?string $tab = null,
        public ?string $group = null,
        public ?string $emptyOption = null,
        public array|string|null $options = null,
    ) {
    }
}
