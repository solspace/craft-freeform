<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects;

use craft\gql\base\Arguments;

/**
 * @deprecated Please use specific interface/type arguments instead
 */
class EmptyArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [];
    }
}
