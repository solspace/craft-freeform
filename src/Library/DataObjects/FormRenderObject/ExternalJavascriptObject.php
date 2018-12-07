<?php

namespace Solspace\Freeform\Library\DataObjects\FormRenderObject;

class ExternalJavascriptObject extends AbstractFormRenderObject
{
    /**
     * @inheritDoc
     */
    public function getFormattedValueOrAttachToView(bool $attachToView)
    {
        $value = $this->getValue();

        if ($attachToView) {
            \Craft::$app->view->registerJsFile($value);

            return null;
        }

        return '<script src="' . $value . '"></script>';
    }
}
