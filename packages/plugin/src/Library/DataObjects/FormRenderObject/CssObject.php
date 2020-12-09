<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class CssObject extends AbstractFormRenderObject
{
    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerCss($this->getValue());
    }

    public function getOutput(): string
    {
        return '<style rel="stylesheet">'.$this->getValue().'</style>';
    }
}
