<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;

class RecaptchaArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The Recaptcha field name (E.g g-recaptcha-response)',
            ],
            'value' => [
                'name' => 'value',
                'type' => Type::string(),
                'description' => 'The Recaptcha API response value',
            ],
        ];
    }
}
