<?php

namespace Solspace\Freeform\Bundles\GraphQL\Mutations;

use craft\gql\base\Mutation;
use Solspace\Freeform\Bundles\GraphQL\Arguments\HeadlessSubmitArguments;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\Mutations\HeadlessSubmitMutationResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\FreeformJsonType;

class HeadlessSubmitMutation extends Mutation
{
    public static function getMutations(): array
    {
        return [
            'freeformHeadlessSubmit' => [
                'name' => 'freeformHeadlessSubmit',
                'type' => FreeformJsonType::getType(),
                'args' => HeadlessSubmitArguments::getArguments(),
                'resolve' => HeadlessSubmitMutationResolver::class.'::resolve',
                'description' => 'Headless form submit (same response contract as POST /freeform/api/forms/{handle}/submit). Requires headless config + GraphQL submission create permission. Multipart file uploads remain REST-only.',
            ],
        ];
    }
}
