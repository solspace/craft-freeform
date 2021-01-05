<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class ExternalJavascriptObject extends AbstractFormRenderObject
{
    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerJsFile($this->getValue());
    }

    public function getOutput(): string
    {
        return '<script src="'.$this->getValue().'"></script>';
    }
}
