<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class SubmissionReCaptchaArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The ReCaptcha field name (E.g "g-recaptcha-response" or "h-recaptcha-response").',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The ReCaptcha verification response value.',
            ],
        ];
    }
}
