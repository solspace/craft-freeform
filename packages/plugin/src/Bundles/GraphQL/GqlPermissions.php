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
        return self::canSchema(self::CATEGORY_SUBMISSIONS.'.all', 'create') || self::canSchema(self::CATEGORY_SUBMISSIONS.'.all', 'save');
    }

    /**
     * @throws GqlException
     */
    public static function canCreateSubmissions(string $formUid): bool
    {
        return self::canSchema(self::CATEGORY_SUBMISSIONS.'.'.$formUid, 'create') || self::canSchema(self::CATEGORY_SUBMISSIONS.'.'.$formUid, 'save');
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
        $formUidsByAction = self::extractAllowedEntitiesFromSchema();
        $formUids = $formUidsByAction[self::CATEGORY_FORMS] ?? [];

        return array_values(array_filter($formUids, function ($uid) {
            return 'all' !== $uid;
        }));
    }
}
