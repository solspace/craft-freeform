<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class StringObject extends AbstractFormRenderObject
{
    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
    }

    public function getOutput(): string
    {
        return $this->getValue();
    }
}
