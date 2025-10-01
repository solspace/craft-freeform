<?php

namespace Solspace\Freeform\Bundles\GraphQL;

use craft\errors\GqlException;
use craft\helpers\Gql;

class GqlPermissions extends Gql
{
    public const CATEGORY_FORMS = 'freeformForms';

    public const CATEGORY_SUBMISSIONS = 'freeformSubmissions';

    private const MUTATE_ACTIONS = ['save', 'create'];

    private static ?array $readScopeCache = null;

    /**
     * Allow if either 'save' (current) or 'create' (legacy) is granted.
     *
     * @throws GqlException
     */
    public static function canCreateAllSubmissions(): bool
    {
        return self::canSchemaAny(self::CATEGORY_SUBMISSIONS.'.all', self::MUTATE_ACTIONS);
    }

    /**
     * Allow if either 'save' (current) or 'create' (legacy) is granted.
     *
     * @throws GqlException
     */
    public static function canCreateSubmissions(string $formUid): bool
    {
        return self::canSchemaAny(self::CATEGORY_SUBMISSIONS.'.'.$formUid, self::MUTATE_ACTIONS);
    }

    public static function canQueryForms(): bool
    {
        // true if ALL or SOME (i.e., anything but NONE)
        return [] !== self::allowedFormUids();
    }

    /**
     * @throws GqlException
     */
    public static function canQueryAllForms(): bool
    {
        return self::canSchema(self::CATEGORY_FORMS.'.all', 'read');
    }

    /**
     * @throws GqlException
     */
    public static function canQueryForm(string $formUid): bool
    {
        return self::canSchema(self::CATEGORY_FORMS.'.'.$formUid, 'read');
    }

    /**
     * Returns:
     *   - null   => "all forms are allowed"
     *   - []     => "no forms are allowed"
     *   - [uids] => "only these forms are allowed"
     */
    public static function allowedFormUids(): ?array
    {
        $scope = self::readScope();
        $formsScope = $scope[self::CATEGORY_FORMS] ?? [];

        if (\in_array('all', $formsScope, true)) {
            return null;
        }

        return array_values($formsScope);
    }

    /**
     * Returns:
     *   - null   => "all forms allowed for mutation"
     *   - []     => "no forms allowed for mutation"
     *   - [uids] => "only these forms allowed for mutation"
     */
    public static function allowedSubmissionUids(): ?array
    {
        $scope = self::readScopeByActions(self::MUTATE_ACTIONS);
        $submissionsScope = $scope[self::CATEGORY_SUBMISSIONS] ?? [];

        if (\in_array('all', $submissionsScope, true)) {
            return null;
        }

        return array_values($submissionsScope);
    }

    private static function readScope(): array
    {
        if (null === self::$readScopeCache) {
            self::$readScopeCache = self::extractAllowedEntitiesFromSchema('read');
        }

        return self::$readScopeCache;
    }

    /**
     * Merge allowed entity scopes across multiple actions.
     */
    private static function readScopeByActions(array $actions): array
    {
        $scopes = [];

        foreach ($actions as $action) {
            $scope = self::extractAllowedEntitiesFromSchema($action);

            foreach ($scope as $category => $uids) {
                if (!isset($scopes[$category])) {
                    $scopes[$category] = [];
                }

                $scopes[$category] = array_values(array_unique(array_merge($scopes[$category], $uids)));
            }
        }

        return $scopes;
    }

    /**
     * True if ANY of the given actions allow the given scope.
     *
     * @throws GqlException
     */
    private static function canSchemaAny(string $scope, array $actions): bool
    {
        foreach ($actions as $action) {
            if (self::canSchema($scope, $action)) {
                return true;
            }
        }

        return false;
    }
}
