<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

interface FormRenderObjectInterface
{
    /**
     * @return mixed
     */
    public function getValue();

    /**
     * @param bool $attachToView
     *
     * @return string|null
     */
    public function getFormattedValueOrAttachToView(bool $attachToView);
}
