<?php

namespace Solspace\Freeform\Library\Templates;

use Solspace\Freeform\Fields\FieldInterface;

final class TemplateFieldValue
{
    public ?int $id;
    public ?string $handle;
    public ?string $label;
    public string $type;
    public string $valueAsString;
    public string $labelsAsString;
    private bool $hasOptions;

    public function __construct(FieldInterface $field, public mixed $value)
    {
        $this->id = $field->getId();
        $this->handle = $field->getHandle();
        $this->label = $field->getLabel();
        $this->type = $field->getType();
        $this->valueAsString = $field->getValueAsString();
        $this->labelsAsString = (string) $field->getReadableOutputValue();
        $this->hasOptions = $field->implements('options');
    }

    public function __toString(): string
    {
        return $this->valueAsString;
    }

    public function implements(string $interface): bool
    {
        return 'options' === $interface && $this->hasOptions;
    }
}
