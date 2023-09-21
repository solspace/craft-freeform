<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use craft\errors\GqlException;
use craft\helpers\Gql;

class GqlPermissions extends Gql
{
    public const CATEGORY_FORMS = 'freeformForms';

    public const CATEGORY_SUBMISSIONS = 'freeformSubmissions';

    /**
     * @throws GqlException
     */
    public static function canCreateAllSubmissions(): bool
    {
        return self::canSchema(self::CATEGORY_SUBMISSIONS.'.all', 'create');
    }

    /**
     * @throws GqlException
     */
    public static function canCreateSubmissions(string $formUid): bool
    {
        return self::canSchema(self::CATEGORY_SUBMISSIONS.'.'.$formUid, 'create');
    }

    /**
     * @throws GqlException
     */
    public static function canQueryForms(): bool
    {
        return self::canSchema(self::CATEGORY_FORMS.'.all');
    }

    public static function allowedFormUids(): array
    {
        $formUids = self::extractAllowedEntitiesFromSchema('read')[self::CATEGORY_FORMS] ?? [];

        return array_filter(array_filter(
            $formUids,
            function ($item) {
                return 'all' !== $item;
            }
        ));
    }
}
