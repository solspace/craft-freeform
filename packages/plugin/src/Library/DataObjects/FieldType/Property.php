<?php

namespace Solspace\Freeform\Library\DataObjects\FieldType;

class Property
{
    public string $type;
    public string $handle;
    public ?string $label;
    public ?string $instructions;
    public ?string $category;
    public int $order;
    public mixed $value;
    public ?string $placeholder;
    public ?string $section;
    public ?array $options;
    public ?array $flags;
    public ?array $visibilityFilters;
    public ?array $middleware;
    public ?string $tab;
    public ?string $group;
    public ?bool $readonly;
}
