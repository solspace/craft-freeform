<?php

namespace Solspace\Freeform\Bundles\GraphQL\Queries;

use craft\gql\base\Query;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FreeformArguments;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FreeformInterface;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FreeformResolver;

class FreeformQuery extends Query
{
    public static function getQueries($checkToken = true): array
    {
        if ($checkToken && !GqlPermissions::canQueryForms()) {
            return [];
        }

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
