<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use Solspace\Commons\Helpers\StringHelper;

class ExternalJavascriptObject extends AbstractFormRenderObject
{
    public function attachToView()
    {
        \Craft::$app->view->registerJsFile($this->getValue(), $this->options);
    }

    public function getOutput(): string
    {
        $options = StringHelper::compileAttributeStringFromArray($this->options);

        return '<script src="'.$this->getValue().'"'.$options.'></script>';
    }
}
