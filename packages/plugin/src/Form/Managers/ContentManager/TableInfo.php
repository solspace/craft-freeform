<?php

namespace Solspace\Freeform\Form\Managers\ContentManager;

class TableInfo
{
    public function __construct(
        private string $tableName,
        private array $fieldColumns
    ) {
    }

    public function getTableName(): string
    {
        return $this->tableName;
    }

    public function getFieldColumnName(int $fieldId): ?string
    {
        foreach ($this->fieldColumns as $column) {
            if (preg_match("/^(.+)_{$fieldId}$/", $column)) {
                return $column;
            }
        }

        return null;
    }
}
