<?php

namespace Solspace\Freeform\Form\Layout;

use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Collections\PageCollection;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;

/**
 * @implements \IteratorAggregate<int, Page>
 */
class Layout implements \IteratorAggregate
{
    private PageCollection $pageCollection;

    private FieldCollection $fieldCollection;

    public function __construct()
    {
        $this->pageCollection = new PageCollection();
        $this->fieldCollection = new FieldCollection();
    }

    public function getPages(): PageCollection
    {
        return $this->pageCollection;
    }

    public function getField(int|string $identificator): ?FieldInterface
    {
        return $this->fieldCollection->get($identificator);
    }

    /**
     * @return FieldCollection|FieldInterface[]
     */
    public function getFields(?string $implements = null): array|FieldCollection
    {
        if (null !== $implements) {
            return $this->fieldCollection->getList($implements);
        }

        return $this->fieldCollection;
    }

    public function getIterator(): \ArrayIterator
    {
        return $this->pageCollection->getIterator();
    }
}
