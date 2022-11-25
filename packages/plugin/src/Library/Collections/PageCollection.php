<?php

namespace Solspace\Freeform\Library\Collections;

use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Exceptions\FreeformException;

/**
 * @implements \IteratorAggregate<int, Page>
 */
class PageCollection implements \IteratorAggregate, \Countable
{
    /** @var Page[] */
    private array $pages = [];

    private int $currentIndex = 0;

    public function current(): Page
    {
        return $this->pages[$this->currentIndex];
    }

    public function setCurrent(int $index): int
    {
        if (!\array_key_exists($index, $this->pages)) {
            throw new FreeformException(sprintf('Could not set "%s" as the current page', $index));
        }

        $this->currentIndex = $index;

        return $this->currentIndex;
    }

    public function get(int|string $identificator): ?Page
    {
        if (is_numeric($identificator)) {
            return $this->pages[$identificator] ?? null;
        }

        return current(
            array_filter(
                $this->pages,
                fn (Page $page) => $page->getHandle()
            )
        );
    }

    public function add(Page $page): self
    {
        $this->pages[] = $page;

        return $this;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->pages);
    }

    public function count(): int
    {
        return \count($this->pages);
    }
}
