<?php

namespace Solspace\Freeform\Services\Pro;

use craft\base\Component;
use Solspace\Freeform\Events\Forms\FormRenderEvent;

class ProFormsService extends Component
{
    public function addOpinionScaleStyles(FormRenderEvent $event)
    {
        static $styleLoaded;

        if (null === $styleLoaded || $event->isNoScriptRenderEnabled()) {
            $freeformPath = \Yii::getAlias('@freeform');
            $form = $event->getForm();

            if ($form->getLayout()->hasOpinionScaleFields()) {
                $opinionScaleCss = file_get_contents(
                    $freeformPath.'/Resources/css/front-end/fields/opinion-scale.css'
                );

                $event->appendCssToOutput($opinionScaleCss);
            }

            $styleLoaded = true;
        }
    }
}
