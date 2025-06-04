<?php

namespace Solspace\Freeform\Library\Migrations;

class Index
{
    public function __construct(
        private array $columns,
        private bool $unique = false,
        private ?string $prefix = null,
        private ?string $name = null
    ) {}

    public function getName(): string
    {
        if (null !== $this->name) {
            return $this->name;
        }

        return ($this->prefix ?? '').implode('_', $this->columns).($this->unique ? '_unq' : '').'_idx';
    }

    public function getColumns(): array
    {
        return $this->columns;
    }

    public function isUnique(): bool
    {
        return $this->unique;
    }
}
