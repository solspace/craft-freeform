<?php

namespace Solspace\Freeform\Library\Migrations;

use yii\db\ColumnSchemaBuilder;

class Field
{
    private string $name;

    private ColumnSchemaBuilder $definition;

    public function __construct(string $name, ColumnSchemaBuilder $definition)
    {
        $this->name = $name;
        $this->definition = $definition;
    }

    public function __toString(): string
    {
        return $this->getName();
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDefinition(): ColumnSchemaBuilder
    {
        return $this->definition;
    }
}
