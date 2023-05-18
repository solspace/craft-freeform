<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\CsrfTokenInputType;

class CsrfTokenInputArguments extends Arguments
{
    public static function getArguments(): array
    {
        $isCsrfEnabled = \Craft::$app->getConfig()->getGeneral()->enableCsrfProtection;

        if ($isCsrfEnabled) {
            return [
                'csrfToken' => [
                    'name' => 'csrfToken',
                    'type' => CsrfTokenInputType::getType(),
                    'description' => 'The CSRF name/value.',
                ],
            ];
        }

        return [];
    }
}
