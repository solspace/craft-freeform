<?php

namespace Solspace\Freeform\Library\Export\Objects;

class ColumnIterator implements \Iterator
{
    /** @var int */
    private $position = 0;

    /** @var Row */
    private $columnCollection;

    /**
     * ColumnIterator constructor.
     */
    public function __construct(Row $columnCollection)
    {
        $this->columnCollection = $columnCollection;
    }

    public function current(): Column
    {
        return $this->columnCollection->getColumn($this->position);
    }

    public function next()
    {
        ++$this->position;
    }

    public function key(): int
    {
        return $this->position;
    }

    public function valid(): bool
    {
        return null !== $this->columnCollection->getColumn($this->position);
    }

    public function rewind()
    {
        $this->position = 0;
    }
}
