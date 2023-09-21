<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\SubmissionCaptchaInputType;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

class SubmissionCaptchaInputArguments extends Arguments
{
    private static Form $form;

    public static function setForm(Form $form): void
    {
        self::$form = $form;
    }

    public static function getArguments(): array
    {
        $integrations = Freeform::getInstance()->integrations->getForForm(self::$form, IntegrationInterface::TYPE_CAPTCHAS);
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
