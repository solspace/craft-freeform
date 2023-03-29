<?php

namespace Solspace\Freeform\Attributes\Property\PropertyTypes\Recipients;

/**
 * @implements \IteratorAggregate<int, Recipient>
 */
class RecipientCollection implements \IteratorAggregate, \ArrayAccess, \Countable
{
    /** @var Recipient[] */
    private array $recipients;

    public function add(Recipient $recipient): self
    {
        $this->recipients[] = $recipient;

        return $this;
    }

    /**
     * @return Recipient[]
     */
    public function getRecipients(): array
    {
        return $this->recipients;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->recipients);
    }

    public function offsetExists($offset): bool
    {
        return isset($this->recipients[$offset]);
    }

    public function offsetGet($offset): Recipient
    {
        return $this->recipients[$offset];
    }

    public function offsetSet($offset, $value): void
    {
        $this->recipients[$offset] = $value;
    }

    public function offsetUnset($offset): void
    {
        unset($this->recipients[$offset]);
    }

    public function count(): int
    {
        return \count($this->recipients);
    }
}
