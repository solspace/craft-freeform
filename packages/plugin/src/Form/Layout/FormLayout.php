<?php

namespace Solspace\Freeform\Form\Layout;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Collections\PageCollection;

/**
 * @implements \IteratorAggregate<int, Page>
 */
class FormLayout implements \IteratorAggregate
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

    public function hasFields(string $implements): bool
    {
        return $this->getFields($implements)->count();
    }

    public function getField(mixed $identificator): ?FieldInterface
    {
        return $this->fieldCollection->get($identificator);
    }

    public function getFields(?string $implements = null): FieldCollection
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
