<?php

namespace Solspace\Freeform\Bundles\Form\Types\Pages;

use Solspace\Freeform\Attributes\Form\Type;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Collections\RowCollection;

#[Type('Page')]
class Page extends Form
{
    public function getPageBackgroundColor(): ?string
    {
        return $this->getSettings()->getGeneral()->getBackgroundColor();
    }

    public function getCanvasRows(): RowCollection
    {
        return $this->getPages()->getByIndex(0)->getRows();
    }
}
