<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\RecaptchaInputType;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Helpers\CaptchaHelper;

class RecaptchaInputArguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $recaptchaEnabled = CaptchaHelper::canApplyCaptcha(self::$form);

        if ($recaptchaEnabled) {
            $fieldHandle = CaptchaHelper::getFieldHandle(self::$form);

            if ($fieldHandle) {
                return [
                    $fieldHandle = [
                        'name' => $fieldHandle,
                        'type' => RecaptchaInputType::getType(),
                        'description' => 'The Recaptcha name/value.',
                    ],
                ];
            }
        }

        return [];
    }
}
