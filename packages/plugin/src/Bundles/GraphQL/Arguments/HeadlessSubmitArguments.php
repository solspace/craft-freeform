<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments;

use craft\gql\base\Arguments;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformJsonType;

class HeadlessSubmitArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'handle' => [
                'name' => 'handle',
                'type' => Type::nonNull(Type::string()),
                'description' => 'Freeform form handle',
            ],
            'intent' => [
                'name' => 'intent',
                'type' => Type::string(),
                'description' => 'Submit intent: submit, next, back, validate, or saveDraft',
                'defaultValue' => 'submit',
            ],
            'values' => [
                'name' => 'values',
                'type' => FreeformJsonType::getType(),
                'description' => 'Field values keyed by handle (same shape as REST headless submit)',
            ],
            'meta' => [
                'name' => 'meta',
                'type' => FreeformJsonType::getType(),
                'description' => 'Honeypot, captcha, javascriptTest, and related meta (REST-compatible)',
            ],
            'context' => [
                'name' => 'context',
                'type' => FreeformJsonType::getType(),
                'description' => 'Submit context (draftToken, draftKey, dynamicNotification, etc.)',
            ],
            'csrfToken' => [
                'name' => 'csrfToken',
                'type' => Type::string(),
                'description' => 'Optional CSRF token (also accepted via X-CSRF-Token). Often unused when Craft GraphQL auth replaces cookie CSRF.',
            ],
        ];
    }
}
