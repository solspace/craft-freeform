<?php

namespace Solspace\Freeform\Library\DataObjects\FieldType;

class Property
{
    public string $type;
    public string $handle;
    public ?string $label;
    public ?string $instructions;
    public ?string $placeholder;
    public ?string $section;
    public int $order;
    public mixed $value;

    public ?array $flags;
    public ?array $middleware;
}
