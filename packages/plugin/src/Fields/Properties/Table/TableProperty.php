<?php

namespace Solspace\Freeform\Fields\Properties\Table;

use Solspace\Freeform\Fields\Pro\TableField;

/**
 * @implements \IteratorAggregate<int, TableColumn>
 */
class TableProperty implements \IteratorAggregate
{
    private array $rows = [];

    public function __construct(array $rows = [])
    {
        foreach ($rows as $column) {
            $this->add(
                $column['label'] ?? '',
                $column['value'] ?? '',
                $column['type'] ?? TableField::COLUMN_TYPE_STRING,
            );
        }
    }

    public function add(string $label, string $value, string $type): self
    {
        $column = new TableColumn();
        $column->label = $label;
        $column->value = $value;
        $column->type = $type;

        $this->rows[] = $column;

        return $this;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->rows);
    }
}
