<?php

namespace Solspace\Freeform\Bundles\GraphQL\Arguments\SimpleObjects;

use craft\gql\base\Arguments;

class EmptyArguments extends Arguments
{
    public static function getArguments(): array
    {
        return [];
    }
}
