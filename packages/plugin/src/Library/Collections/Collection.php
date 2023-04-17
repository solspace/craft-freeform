<?php

namespace Solspace\Freeform\Library\Collections;

/**
 * @template T
 */
abstract class Collection implements \IteratorAggregate, \ArrayAccess, \Countable
{
    /** @var T[] */
    protected array $items;

    /**
     * @param T[] $items
     */
    public function __construct(array $items = [])
    {
        $this->items = $items;
    }

    /**
     * @param T $item
     */
    public function add($item): self
    {
        $this->items[] = $item;

        return $this;
    }

    /**
     * @return T[]
     */
    public function all(): array
    {
        return $this->items;
    }

    /**
     * @return \ArrayIterator<int, T>
     */
    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->items);
    }

    public function offsetExists($offset): bool
    {
        return isset($this->items[$offset]);
    }

    /**
     * @return T
     */
    public function offsetGet(mixed $offset)
    {
        return $this->items[$offset];
    }

    /**
     * @param T $value
     */
    public function offsetSet(mixed $offset, $value): void
    {
        $this->items[$offset] = $value;
    }

    public function offsetUnset($offset): void
    {
        unset($this->items[$offset]);
    }

    public function count(): int
    {
        return \count($this->items);
    }
}
