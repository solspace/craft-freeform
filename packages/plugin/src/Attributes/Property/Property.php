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
    public const TYPE_COLOR_PICKER = 'colorPicker';
    public const TYPE_DATE_PICKER = 'datePicker';
    public const TYPE_TIME_PICKER = 'timePicker';
    public const TYPE_DATE_TIME_PICKER = 'datetimePicker';
    public const TYPE_ATTRIBUTES = 'attributes';
    public const TYPE_LABEL = 'label';
    public const TYPE_RECIPIENTS = 'recipients';
    public const TYPE_NOTIFICATION_TEMPLATE = 'notificationTemplate';
    public const TYPE_RECIPIENT_MAPPING = 'recipientMapping';
    public const TYPE_FIELD = 'field';

    public function __construct(
        public ?string $label = null,
        public ?string $instructions = null,
        public ?string $type = null,
        public ?string $category = null,
        public ?int $order = null,
        public mixed $value = null,
        public bool $required = false,
        public ?string $transformer = null,
        public ?string $valueGenerator = null,
        public ?string $placeholder = null,
        public ?string $emptyOption = null,
        public array|string|null $options = null,
    ) {
    }
}
