<?php

namespace Solspace\Freeform\Fields\Parameters;

/**
 * @property string $id
 * @property string $fieldIdPrefix
 */
class Parameters
{
    private array $parameters = [];

    public function __get(string $name)
    {
        return $this->parameters[$name] ?? null;
    }

    public function __isset(string $name): bool
    {
        return isset($this->parameters[$name]);
    }

    public function add(string $key, mixed $value): self
    {
        $this->parameters[$key] = $value;

        return $this;
    }
}
