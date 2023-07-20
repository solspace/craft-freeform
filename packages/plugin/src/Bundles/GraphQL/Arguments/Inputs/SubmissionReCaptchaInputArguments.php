<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\SubmissionReCaptchaInputType;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Helpers\ReCaptchaHelper;

class SubmissionReCaptchaInputArguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $reCaptchaEnabled = ReCaptchaHelper::canApplyReCaptcha(self::$form);

        if ($reCaptchaEnabled) {
            return [
                'reCaptcha' => [
                    'name' => 'reCaptcha',
                    'type' => SubmissionReCaptchaInputType::getType(),
                    'description' => 'The Recaptcha name/value.',
                ],
            ];
        }

        return [];
    }
}
