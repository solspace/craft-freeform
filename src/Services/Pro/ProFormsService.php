<?php

namespace Solspace\Freeform\Services\Pro;

use craft\base\Component;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Fields\Pro\DatetimeField;

class ProFormsService extends Component
{
    /**
     * @param FormRenderEvent $event
     */
    public function addDateTimeJavascript(FormRenderEvent $event)
    {
        $freeformPath = \Yii::getAlias('@freeform');
        $form         = $event->getForm();

        if ($form->getLayout()->hasDatepickerEnabledFields()) {
            $datepickerJs = file_get_contents(
                $freeformPath . '/Resources/js/other/front-end/fields/datepicker.js'
            );

            $event->appendJsToOutput(
                $datepickerJs,
                [
                    'locale'     => DatetimeField::getSupportedLocale(\Craft::$app->locale->id),
                    'formAnchor' => $form->getAnchor(),
                ]
            );
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addPhonePatternJavascript(FormRenderEvent $event)
    {
        $freeformPath = \Yii::getAlias('@freeform');
        $form         = $event->getForm();

        if ($form->getLayout()->hasPhonePatternFields()) {
            $imaskJs = file_get_contents($freeformPath . '/Resources/js/other/front-end/fields/input-mask.js');
            $event->appendJsToOutput($imaskJs, ['formAnchor' => $form->getAnchor()]);
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addOpinionScaleStyles(FormRenderEvent $event)
    {
        static $styleLoaded;

        if (null === $styleLoaded || $event->isNoScriptRenderEnabled()) {
            $freeformPath = \Yii::getAlias('@freeform');
            $form         = $event->getForm();

            if ($form->getLayout()->hasOpinionScaleFields()) {
                $opinionScaleCss = file_get_contents(
                    $freeformPath . '/Resources/css/form-frontend/fields/opinion-scale.css'
                );

                $event->appendCssToOutput($opinionScaleCss);
            }

            $styleLoaded = true;
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addSignatureJavascript(FormRenderEvent $event)
    {
        static $scriptLoaded;

        $freeformPath = \Yii::getAlias('@freeform');
        $form         = $event->getForm();

        if (null === $scriptLoaded || $event->isNoScriptRenderEnabled()) {
            if ($form->getLayout()->hasSignatureFields()) {
                $signatureJs = file_get_contents(
                    $freeformPath . '/Resources/js/lib/signature-pad/signature-pad.2.3.2.js'
                );

                $event->appendJsToOutput($signatureJs);
            }

            $scriptLoaded = true;
        }

        if ($form->getLayout()->hasSignatureFields()) {
            $signatureJs = file_get_contents(
                $freeformPath . '/Resources/js/other/front-end/fields/signature.js'
            );

            $event->appendJsToOutput($signatureJs, ['formAnchor' => $form->getAnchor()]);
        }
    }

    /**
     * @param FormRenderEvent $event
     */
    public function addTableJavascript(FormRenderEvent $event)
    {
        $freeformPath = \Yii::getAlias('@freeform');
        $form = $event->getForm();

        if ($form->getLayout()->hasTableFields()) {
            $tableJs = file_get_contents($freeformPath . '/Resources/js/other/front-end/fields/table.js');
            $event->appendJsToOutput($tableJs, ['formAnchor' => $form->getAnchor()]);
        }
    }
}
