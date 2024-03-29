<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class SubmissionCaptchaArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The Captcha field name (E.g "g-recaptcha-response" or "h-captcha-response").',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The Captcha verification response value.',
            ],
        ];
    }
}
