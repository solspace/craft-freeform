<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\HoneypotInputType;
use Solspace\Freeform\Freeform;

class HoneypotInputArguments extends Arguments
{
    public static function getArguments(): array
    {
        $isHoneypotEnabled = Freeform::getInstance()->settings->isFreeformHoneypotEnabled();

        if ($isHoneypotEnabled) {
            return [
                'honeypot' => [
                    'name' => 'honeypot',
                    'type' => HoneypotInputType::getType(),
                    'description' => 'The honeypot name/value.',
                ],
            ];
        }

        return [];
    }
}
