<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\RecaptchaInputType;
use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

class RecaptchaInputArguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        if (!Freeform::getInstance()->settings->getSettingsModel()->recaptchaEnabled) {
            return [];
        }

        // or if the form has the property disableRecaptcha set to true, then bail
        if (self::$form->getPropertyBag()->get(Form::DATA_DISABLE_RECAPTCHA)) {
            return [];
        }

        // or if the form has payment fields, then bail
        if (\count(self::$form->getLayout()->getFields(PaymentInterface::class))) {
            return [];
        }

        $fields = [];

        foreach (self::$form->getLayout()->getFields() as $field) {
            if ($field instanceof RecaptchaField) {
                $fieldHandle = $field->getHandle();

                $fields[$fieldHandle] = [
                    'name' => $fieldHandle,
                    'type' => RecaptchaInputType::getType(),
                    'description' => 'The Recaptcha name/value for the submission',
                ];
            }
        }

        return $fields;
    }
}
