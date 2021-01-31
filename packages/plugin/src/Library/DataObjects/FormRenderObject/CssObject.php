<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use Solspace\Commons\Helpers\StringHelper;

class CssObject extends AbstractFormRenderObject
{
    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerCss($this->getValue(), $this->options);
    }

    public function getOutput(): string
    {
        $options = StringHelper::compileAttributeStringFromArray($this->options);

        return '<style rel="stylesheet"'.$options.'>'.$this->getValue().'</style>';
    }
}
