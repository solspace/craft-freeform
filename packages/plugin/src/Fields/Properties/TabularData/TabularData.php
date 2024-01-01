<?php

namespace Solspace\Freeform\Fields\Properties\TabularData;

/**
 * @extends \IteratorAggregate<int, string[]>
 */
class TabularData implements \IteratorAggregate, \Countable
{
    public function __construct(
        private array $rows = []
    ) {}

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->rows);
    }

    public function count(): int
    {
        return \count($this->rows);
    }
}
