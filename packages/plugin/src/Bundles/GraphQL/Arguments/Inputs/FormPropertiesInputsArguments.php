<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs;

use craft\gql\base\Arguments;
use Solspace\Freeform\Bundles\GraphQL\Types\Inputs\FormPropertiesInputType;

class FormPropertiesInputsArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [
            'formProperties' => [
                'name' => 'formProperties',
                'type' => FormPropertiesInputType::getType(),
                'description' => 'Form properties overrides.',
            ],
        ];
    }
}
