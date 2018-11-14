<?php

namespace Solspace\Freeform\Services;

use craft\web\View;
use Solspace\Freeform\Events\Forms\FormRenderEvent;

class FormAjaxService extends BaseService
{
    /**
     * @param FormRenderEvent $event
     */
    public function addAjaxJavascript(FormRenderEvent $event)
    {
        static $ajaxJsLoaded;

        if (null === $ajaxJsLoaded && $event->getForm()->isAjaxEnabled()) {
            $ajaxJs = file_get_contents(\Yii::getAlias('@freeform') . '/Resources/js/cp/form-frontend/form/ajaxify-form.js');
            if ($this->getSettingsService()->isFooterScripts()) {
                \Craft::$app->view->registerJs($ajaxJs, View::POS_END);
            } else {
                $event->appendJsToOutput($ajaxJs);
            }
        }
    }
}
