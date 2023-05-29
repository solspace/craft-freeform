<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

class CaptchaHelper
{
    public static function canApplyCaptcha(Form $form): bool
    {
        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        // If global settings are false, then bail
        if (!$settingsModel->recaptchaEnabled) {
            return false;
        }

        // or if the form has the property disableRecaptcha set to true, then bail
        if ($form->getPropertyBag()->get(Form::DATA_DISABLE_RECAPTCHA)) {
            return false;
        }

        // or if the form has payment fields, then bail
        if (\count($form->getLayout()->getFields(PaymentInterface::class))) {
            // FIXME
            // return false;
        }

        // or if using the invisible recaptcha and the form settings for "Enable Captchas" is set to false, then bail
        if ($settingsModel->isInvisibleRecaptchaSetUp() && !$form->isRecaptchaEnabled()) {
            return false;
        }

        // and finally if using the checkbox recaptcha and the form doesn't have a recaptcha field, then bail
        if (!$settingsModel->isInvisibleRecaptchaSetUp() && !$form->getLayout()->hasFields(RecaptchaField::class)) {
            return false;
        }

        return true;
    }

    public static function getFieldHandle(Form $form): ?string
    {
        $fields = $form->getLayout()->getFields(RecaptchaField::class);
        $field = reset($fields);

        if ($field) {
            return $field->getHandle();
        }

        return null;
    }
}
