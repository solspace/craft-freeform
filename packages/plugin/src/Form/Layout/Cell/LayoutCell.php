<?php

namespace Solspace\Freeform\Form\Layout\Cell;

use Solspace\Freeform\Library\Collections\RowCollection;

class LayoutCell extends Cell implements \IteratorAggregate
{
    private RowCollection $rowCollection;

    public function __construct(array $config)
    {
        $this->rowCollection = new RowCollection();
    }

    public function getRows(): RowCollection
    {
        return $this->rowCollection;
    }

    public function getIterator(): \ArrayIterator
    {
        return $this->rowCollection->getIterator();
    }
}
