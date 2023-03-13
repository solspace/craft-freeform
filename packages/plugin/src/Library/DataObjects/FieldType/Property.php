<?php

namespace Solspace\Freeform\Library\DataObjects\FieldType;

use Solspace\Freeform\Attributes\Property\TransformerInterface;

class Property
{
    public string $type;
    public string $handle;
    public ?string $label;
    public ?string $instructions;
    public int $order;
    public mixed $value;
    public ?bool $required;
    public ?string $placeholder;
    public ?string $section;
    public ?array $options;
    public ?array $flags;
    public ?array $visibilityFilters;
    public ?array $middleware;
    public ?TransformerInterface $transformer;

    public function hasFlag(string $name): bool
    {
        if (null === $this->flags) {
            return false;
        }

        return \in_array($name, $this->flags, true);
    }
}
