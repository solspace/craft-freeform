<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

interface FormRenderObjectInterface
{
    /**
     * @return mixed
     */
    public function getValue();

    /**
     * Attach the object to view.
     */
    public function attachToView();

    public function getOutput(): string;
}
