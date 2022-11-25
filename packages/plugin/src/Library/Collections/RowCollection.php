<?php

namespace Solspace\Freeform\Library\Collections;

use Solspace\Freeform\Form\Layout\Row;

/**
 * @implements \IteratorAggregate<int, Row>
 */
class RowCollection implements \IteratorAggregate, \Countable
{
    /** @var Row[] */
    private array $rows = [];

    private FieldCollection $fieldCollection;

    public function __construct()
    {
        $this->fieldCollection = new FieldCollection();
    }

    public function add(Row $row): self
    {
        $this->rows[] = $row;

        return $this;
    }

    public function getFields(): FieldCollection
    {
        return $this->fieldCollection;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->rows);
    }

    public function count(): int
    {
        return \count($this->rows);
    }
}
