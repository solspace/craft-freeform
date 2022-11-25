<?php

namespace Solspace\Freeform\Library\Collections;

use Solspace\Freeform\Form\Layout\Cell\CellInterface;

/**
 * @implements \IteratorAggregate<int, CellInterface>
 */
class CellCollection implements \IteratorAggregate, \Countable
{
    private array $cells = [];

    private FieldCollection $fieldCollection;

    public function __construct()
    {
        $this->fieldCollection = new FieldCollection();
    }

    public function add(CellInterface $cell): self
    {
        $this->cells[] = $cell;

        return $this;
    }

    public function getFields(): FieldCollection
    {
        return $this->fieldCollection;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->cells);
    }

    public function count(): int
    {
        return \count($this->cells);
    }
}
