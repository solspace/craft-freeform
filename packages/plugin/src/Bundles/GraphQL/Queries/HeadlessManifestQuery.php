<?php

namespace Solspace\Freeform\Bundles\GraphQL\Queries;

use craft\gql\base\Query;
use Solspace\Freeform\Bundles\GraphQL\Arguments\HeadlessManifestArguments;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\HeadlessManifestResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformJsonType;

class HeadlessManifestQuery extends Query
{
    /**
     * @param mixed $checkToken
     */
    public static function getQueries($checkToken = true): array
    {
        return [
            'freeformHeadlessManifest' => [
                'type' => FreeformJsonType::getType(),
                'args' => HeadlessManifestArguments::getArguments(),
                'resolve' => HeadlessManifestResolver::class.'::resolve',
                'description' => 'Headless form manifest (same contract as GET /freeform/api/forms/{handle}/manifest data). Requires headless config + GraphQL form read permission.',
            ],
        ];
    }
}
