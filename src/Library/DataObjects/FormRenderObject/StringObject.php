<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class StringObject extends AbstractFormRenderObject
{
    /**
     * @inheritDoc
     */
    public function getFormattedValueOrAttachToView(bool $attachToView)
    {
        return $this->getValue();
    }
}
