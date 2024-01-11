<?php

namespace Solspace\Freeform\Form\Managers\ContentManager;

class TableInfo
{
    public function __construct(
        private string $tableName,
        private array $columns
    ) {}

    public function getTableName(): string
    {
        return $this->tableName;
    }

    public function updateTableName(string $name): self
    {
        $this->tableName = $name;

        return $this;
    }

    public function getFieldColumnFieldIds(): array
    {
        return array_map(
            fn ($column) => (int) preg_replace('/^.+_(\d+)$/', '$1', $column),
            array_filter(
                $this->columns,
                fn ($column) => preg_match('/^.+_\d+$/', $column)
            )
        );
    }

    public function getFieldColumnName(int $fieldId): ?string
    {
        foreach ($this->columns as $column) {
            if (preg_match("/^(.+)_{$fieldId}$/", $column)) {
                return $column;
            }
        }

        return null;
    }

    public function renameFieldColumn(int $fieldId, string $name): self
    {
        $oldName = $this->getFieldColumnName($fieldId);
        if (!$oldName) {
            return $this;
        }

        $index = array_search($oldName, $this->columns);
        $this->columns[$index] = $name;

        return $this;
    }

    public function removeColumn(int $fieldId): self
    {
        $oldName = $this->getFieldColumnName($fieldId);
        if (!$oldName) {
            return $this;
        }

        $index = array_search($oldName, $this->columns);
        unset($this->columns[$index]);

        return $this;
    }

    public function addColumn(string $name): self
    {
        $this->columns[] = $name;

        return $this;
    }
}
