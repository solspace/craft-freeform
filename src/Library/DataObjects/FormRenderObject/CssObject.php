<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class CssObject extends AbstractFormRenderObject
{
    /**
     * @inheritDoc
     */
    public function getFormattedValueOrAttachToView(bool $attachToView)
    {
        $value = $this->getValue();

        if ($attachToView) {
            \Craft::$app->view->registerCss($value);

            return null;
        }

        return '<style rel="stylesheet">' . $value . '</style>';
    }
}
