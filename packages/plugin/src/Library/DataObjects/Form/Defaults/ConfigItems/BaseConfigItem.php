<?php

namespace Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems;

abstract class BaseConfigItem implements DefaultConfigInterface
{
    public bool $locked = false;
    public mixed $value = '';
    public string $placeholder = '';

    private string $label = '';

    public function __construct(array $config = [])
    {
        foreach ($config as $property => $value) {
            $setter = 'set'.ucfirst($property);

            if (method_exists($this, $setter)) {
                $this->{$setter}($value);

                continue;
            }

            if (property_exists($this, $property)) {
                $this->{$property} = $value;
            }
        }
    }

    public function setLabel(string $label): void
    {
        $this->label = $label;
    }

    public function getPlaceholder(): string
    {
        return $this->placeholder;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function isLocked(): bool
    {
        return $this->locked;
    }

    public function toArray(): array
    {
        return [
            'value' => $this->value,
            'locked' => $this->locked,
        ];
    }
}
