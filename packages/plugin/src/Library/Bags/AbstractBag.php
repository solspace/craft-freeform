<?php

namespace Solspace\Freeform\Library\Bags;

use Solspace\Freeform\Library\Exceptions\FreeformException;

abstract class AbstractBag implements BagInterface
{
    /** @var array */
    protected $contents;

    public function __construct(array $contents = [])
    {
        $this->contents = $contents;
    }

    public function __get($name)
    {
        return $this->get($name);
    }

    public function __set($name, $value)
    {
        return $this->set($name, $value);
    }

    public function __isset($name)
    {
        return true;
    }

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

    public function toArray(): array
    {
        return $this->contents;
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->contents);
    }
}
