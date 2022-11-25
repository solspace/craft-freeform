<?php

namespace Solspace\Freeform\Form\Layout;

use Solspace\Freeform\Form\Layout\Cell\Cell;
use Solspace\Freeform\Library\Collections\CellCollection;
use Solspace\Freeform\Library\Collections\FieldCollection;

/**
 * @implements \IteratorAggregate<int, Cell>
 */
class Row implements \IteratorAggregate
{
    private ?int $id;
    private ?string $uid;
    private string $label;
    private string $handle;
    private int $index;

    private CellCollection $cellCollection;

    private FieldCollection $fieldCollection;

    public function __construct(array $config = [])
    {
        $this->id = $config['id'] ?? null;
        $this->uid = $config['uid'] ?? null;
        $this->label = $config['label'] ?? '';
        $this->handle = $config['handle'] ?? '';
        $this->index = $config['index'] ?? 0;

        $this->cellCollection = new CellCollection();
        $this->fieldCollection = new FieldCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getHandle(): string
    {
        return $this->handle;
    }

    public function getIndex(): int
    {
        return $this->index;
    }

    public function getCells(): CellCollection
    {
        return $this->cellCollection;
    }

    public function getFields(): FieldCollection
    {
        return $this->fieldCollection;
    }

    public function getIterator(): \ArrayIterator
    {
        return $this->cellCollection->getIterator();
    }
}
