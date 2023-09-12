<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\SubmissionCaptchaInputType;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class SubmissionCaptchaInputArguments extends Arguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $integrations = Freeform::getInstance()->captchas->getFormIntegrations(self::$form);
        if (!$integrations) {
            return [];
        }

        $enabled = array_filter($integrations, function ($integration) {
            return $integration->isEnabled();
        });

        if (!$enabled) {
            return [];
        }

        return [
            'captcha' => [
                'name' => 'captcha',
                'type' => SubmissionCaptchaInputType::getType(),
                'description' => 'The Captcha name/value.',
            ],
        ];
    }
}
