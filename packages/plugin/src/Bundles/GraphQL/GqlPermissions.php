<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use craft\helpers\Gql;

class GqlPermissions extends Gql
{
    const CATEGORY_FORMS = 'freeformForms';

    public static function canQueryForms(): bool
    {
        return self::canSchema(self::CATEGORY_FORMS.'.all');
    }

    public static function allowedFormUids(): array
    {
        $formUids = self::extractAllowedEntitiesFromSchema('read')[self::CATEGORY_FORMS] ?? [];

        return array_filter(
            $formUids,
            function ($item) {
                return 'all' !== $item;
            }
        );
    }
}
