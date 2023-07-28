<?php

namespace Solspace\Freeform\Form\Layout;

use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Collections\RowCollection;

/**
 * @implements \IteratorAggregate<int, Row>
 */
class Page implements \IteratorAggregate
{
    private ?int $id;
    private ?string $uid;
    private string $label;
    private int $index;

    private PageButtons $buttons;

    public function __construct(
        private Layout $layout,
        array $config = [],
    ) {
        $this->id = $config['id'] ?? null;
        $this->uid = $config['uid'] ?? null;
        $this->label = $config['label'] ?? '';
        $this->index = $config['index'] ?? 0;

        $this->buttons = new PageButtons($config['metadata']['buttons'] ?? []);
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

    public function getIndex(): int
    {
        return $this->index;
    }

    public function getRows(): RowCollection
    {
        return $this->layout->getRows();
    }

    public function getFields(string|array|null $implements = null, ?string $strategy = null): FieldCollection
    {
        return $this->layout->getFields()->getList($implements, $strategy);
    }

    public function getButtons(): PageButtons
    {
        return $this->buttons;
    }

    public function getIterator(): \ArrayIterator
    {
        return $this->layout->getRows()->getIterator();
    }
}
