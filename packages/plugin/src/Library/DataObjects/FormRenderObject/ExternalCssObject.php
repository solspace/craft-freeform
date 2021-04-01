<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use Solspace\Commons\Helpers\StringHelper;

class ExternalCssObject extends AbstractFormRenderObject
{
    public function attachToView()
    {
        \Craft::$app->view->registerCssFile($this->getValue(), $this->options);
    }

    public function getOutput(): string
    {
        $options = StringHelper::compileAttributeStringFromArray($this->options);

        return '<link rel="stylesheet" href="'.$this->getValue().'"'.$options.' />';
    }
}
