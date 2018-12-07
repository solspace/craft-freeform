<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

use craft\web\View;

class JavascriptObject extends AbstractFormRenderObject
{
    /**
     * @inheritDoc
     */
    public function getFormattedValueOrAttachToView(bool $attachToView)
    {
        $value = $this->getValue();

        if ($attachToView) {
            \Craft::$app->view->registerJs($value, View::POS_END);

            return null;
        }

        return '<script>' . $value . '</script>';
    }
}
