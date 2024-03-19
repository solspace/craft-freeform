<?php

namespace Solspace\Freeform\Library\Migrations;

use yii\db\ColumnSchemaBuilder;

class Table
{
    private string $name;

    private ?string $options;

    private array $fields;

    private array $indexes;

    private array $foreignKeys;

    public function __construct(
        string $name,
        ?string $options = null
    ) {
        $this->name = $name;
        $this->options = $options;
        $this->fields = [];
        $this->indexes = [];
        $this->foreignKeys = [];
    }

    public function __toString(): string
    {
        return $this->getName();
    }

    public function getDatabaseName(): string
    {
        return '{{%'.$this->getName().'}}';
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getOptions(): ?string
    {
        return $this->options;
    }

    public function addField(string $name, ColumnSchemaBuilder $definition): self
    {
        $this->fields[] = new Field($name, $definition);

        return $this;
    }

    public function addIndex(array $columns, bool $unique = false, ?string $prefix = null): self
    {
        $this->indexes[] = new Index($columns, $unique, $prefix);

        return $this;
    }

    public function addForeignKey(
        string $column,
        string $refTable,
        string $refColumn,
        ?string $onDelete = null,
        ?string $onUpdate = null
    ): self {
        $this->foreignKeys[] = new ForeignKey(
            $this,
            $column,
            $refTable,
            $refColumn,
            $onDelete,
            $onUpdate
        );

        return $this;
    }

    public function getFieldArray(): array
    {
        $data = [];

        foreach ($this->fields as $field) {
            $data[$field->getName()] = $field->getDefinition();
        }

        return $data;
    }

    public function getIndexes(): array
    {
        return $this->indexes;
    }

    public function getForeignKeys(): array
    {
        return $this->foreignKeys;
    }
}
