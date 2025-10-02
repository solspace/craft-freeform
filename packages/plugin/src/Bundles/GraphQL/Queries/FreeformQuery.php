<?php

namespace Solspace\Freeform\Bundles\GraphQL\Queries;

use craft\gql\base\Query;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FreeformArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FreeformResolver;

class FreeformQuery extends Query
{
    /**
     * @param mixed $checkToken
     */
    public static function getQueries($checkToken = true): array
    {
        return [
            'freeform' => [
                'type' => FreeformInterface::getType(),
                'args' => FreeformArguments::getArguments(),
                'resolve' => FreeformResolver::class.'::resolve',
                'description' => "This query is used to query Freeform's forms and submissions",
            ],
        ];
    }
}
