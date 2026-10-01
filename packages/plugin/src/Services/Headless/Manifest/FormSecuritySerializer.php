<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Bundles\GraphQL\Resolvers\CaptchaResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\HoneypotResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\JavascriptTestResolver;
use Solspace\Freeform\Form\Form;

/**
 * Headless manifest security metadata — shared with GraphQL resolvers.
 */
class FormSecuritySerializer
{
    /**
     * @return array<string, mixed>
     */
    public function serialize(Form $form, bool $csrfRequired): array
    {
        return array_filter([
            'csrf' => [
                'required' => $csrfRequired,
                'tokenEndpoint' => '/freeform/tokens',
                'submitAs' => [
                    'json' => 'header',
                    'multipart' => 'field',
                ],
            ],
            'honeypot' => HoneypotResolver::resolveForForm($form),
            'javascriptTest' => JavascriptTestResolver::resolveForForm($form),
            'captchas' => CaptchaResolver::resolveForForm($form),
        ], static fn ($value) => null !== $value);
    }
}
