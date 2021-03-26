<?php

namespace Solspace\Freeform\Form\Bags;

use Solspace\Freeform\Library\Bags\BagInterface;

class AttributeBag implements BagInterface
{
    private $attributes;

    public function isset(string $key): bool
    {
        return isset($this->attributes[$key]);
    }

    public function get(string $key, $defaultValue = null)
    {
        return $this->attributes[$key] ?? $defaultValue;
    }

    public function add(string $key, $value): self
    {
        $this->attributes[$key] = $value;

        return $this;
    }

    public function remove(string $key): self
    {
        unset($this->attributes[$key]);

        return $this;
    }

    public function jsonSerialize()
    {
        return $this->attributes;
    }
}
