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
     *
     * @param Row $columnCollection
     */
    public function __construct(Row $columnCollection)
    {
        $this->columnCollection = $columnCollection;
    }

    /**
     * @return Column
     */
    public function current(): Column
    {
        return $this->columnCollection->getColumn($this->position);
    }

    public function next()
    {
        $this->position++;
    }

    /**
     * @return int
     */
    public function key(): int
    {
        return $this->position;
    }

    /**
     * @return bool
     */
    public function valid(): bool
    {
        return $this->columnCollection->getColumn($this->position) !== null;
    }

    public function rewind()
    {
        $this->position = 0;
    }
}
