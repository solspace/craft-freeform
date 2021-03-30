<?php

namespace Solspace\Freeform\Library\Bags;

use Solspace\Freeform\Library\Exceptions\FreeformException;

abstract class AbstractBag implements BagInterface
{
    /** @var array */
    protected $contents = [];

    public function isset(string $key): bool
    {
        return isset($this->contents[$key]);
    }

    public function get(string $key, $defaultValue = null)
    {
        return $this->contents[$key] ?? $defaultValue;
    }

    public function set(string $key, $value): BagInterface
    {
        $this->contents[$key] = $value;

        return $this;
    }

    public function remove(string $key): BagInterface
    {
        unset($this->contents[$key]);

        return $this;
    }

    public function merge($bag): BagInterface
    {
        if (!\is_array($bag) && !$bag instanceof BagInterface) {
            throw new FreeformException('Cannot merge incompatible bags');
        }

        foreach ($bag as $key => $value) {
            $this->contents[$key] = $value;
        }

        return $this;
    }

    public function jsonSerialize(): array
    {
        return $this->contents;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->contents);
    }
}
