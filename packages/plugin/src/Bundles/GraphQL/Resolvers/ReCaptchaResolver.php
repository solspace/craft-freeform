<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\ReCaptchaHelper;
use Solspace\Freeform\Models\Settings;

class ReCaptchaResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): ?array
    {
        $reCaptchaEnabled = ReCaptchaHelper::canApplyReCaptcha($source);

        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        $isHCaptcha = \in_array($settingsModel->getRecaptchaType(), [Settings::RECAPTCHA_TYPE_H_INVISIBLE, Settings::RECAPTCHA_TYPE_H_CHECKBOX], true);

        if ($reCaptchaEnabled) {
            return [
                'enabled' => true,
                'name' => $isHCaptcha ? 'h-recaptcha-response' : 'g-recaptcha-response',
            ];
        }

        return null;
    }
}
