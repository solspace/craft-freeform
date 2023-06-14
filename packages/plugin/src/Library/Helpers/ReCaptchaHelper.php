<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Fields\Implementations\RecaptchaField;
use Solspace\Freeform\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class ReCaptchaHelper
{
    public static function canApplyReCaptcha(Form $form): bool
    {
        $layout = $form->getLayout();
        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        // If global settings are false, then bail
        if (!$settingsModel->recaptchaEnabled) {
            return false;
        }

        // or if the form has the property disableRecaptcha set to true, then bail
        if ($form->getProperties()->get(Form::DATA_DISABLE_RECAPTCHA)) {
            return false;
        }

        // or if the form has payment fields, then bail
        if (\count($layout->getFields(PaymentInterface::class))) {
            return false;
        }

        // or if using the invisible recaptcha and the form settings for "Enable Captchas" is set to false, then bail
        if ($settingsModel->isInvisibleRecaptchaSetUp() && !$form->isRecaptchaEnabled()) {
            return false;
        }

        // and finally if using the checkbox recaptcha and the form doesn't have a recaptcha field, then bail
        if (!$settingsModel->isInvisibleRecaptchaSetUp() && !$layout->hasFields(RecaptchaField::class)) {
            return false;
        }

        return true;
    }
}
