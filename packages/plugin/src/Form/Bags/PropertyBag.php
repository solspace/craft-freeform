<?php

namespace Solspace\Freeform\Form\Bags;

use Solspace\Freeform\Library\Bags\BagInterface;

class PropertyBag implements BagInterface
{
    private $properties;

    public function isset(string $key): bool
    {
        return isset($this->properties[$key]);
    }

    public function get(string $key, $defaultValue = null)
    {
        return $this->properties[$key] ?? $defaultValue;
    }

    public function add(string $key, $value): self
    {
        $this->properties[$key] = $value;

        return $this;
    }

    public function remove(string $key): self
    {
        unset($this->properties[$key]);

        return $this;
    }

    public function jsonSerialize()
    {
        return $this->properties;
    }
}
