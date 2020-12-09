<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use craft\web\View;

class JavascriptObject extends AbstractFormRenderObject
{
    /**
     * Attach the object to view.
     */
    public function attachToView()
    {
        \Craft::$app->view->registerJs($this->getValue(), View::POS_END);
    }

    public function getOutput(): string
    {
        return '<script>'.$this->getValue().'</script>';
    }
}
