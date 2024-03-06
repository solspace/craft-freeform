<?php

namespace Solspace\Freeform\Library\Helpers;

use yii\web\ForbiddenHttpException;

class PermissionHelper
{
    /**
     * Checks a given permission for the currently logged in user.
     *
     * @param bool $checkForNested - see nested permissions for matching permission name root
     */
    public static function checkPermission(string $permissionName, bool $checkForNested = false): bool
    {
        if (self::isAdmin()) {
            return true;
        }

        $user = \Craft::$app->getUser();
        $permissionName = strtolower($permissionName);

        if (self::permissionsEnabled()) {
            if ($checkForNested) {
                if (!$user->getId()) {
                    return false;
                }

                $permissionList = \Craft::$app->userPermissions->getPermissionsByUserId($user->getId());
                foreach ($permissionList as $permission) {
                    if (str_starts_with($permission, $permissionName)) {
                        return true;
                    }
                }
            }

            return $user->checkPermission($permissionName);
        }

        return false;
    }

    /**
     * @throws ForbiddenHttpException
     */
    public static function requirePermission(string $permissionName)
    {
        if (self::isAdmin()) {
            return;
        }

        $user = \Craft::$app->getUser();
        $permissionName = strtolower($permissionName);

        if (!$user->checkPermission($permissionName)) {
            throw new ForbiddenHttpException('User is not permitted to perform this action');
        }
    }

    /**
     * Fetches all nested allowed permission IDs from a nested permission set.
     *
     * @return array|bool
     */
    public static function getNestedPermissionIds(string $permissionName)
    {
        if (self::isAdmin()) {
            return true;
        }

        $user = \Craft::$app->getUser();
        $permissionName = strtolower($permissionName);
        $idList = [];

        if (self::permissionsEnabled()) {
            if (!$user->getId()) {
                return [];
            }

            $permissionList = \Craft::$app->userPermissions->getPermissionsByUserId($user->getId());
            foreach ($permissionList as $permission) {
                if (str_starts_with($permission, $permissionName)) {
                    if (!str_contains($permission, ':')) {
                        continue;
                    }

                    [$name, $id] = explode(':', $permission);

                    $idList[] = $id;
                }
            }

            return $idList;
        }

        return self::isAdmin();
    }

    /**
     * Combines a nested permission with ID.
     *
     * @param string $permissionName
     * @param int    $id
     */
    public static function prepareNestedPermission($permissionName, $id): string
    {
        return $permissionName.':'.$id;
    }

    /**
     * Returns true if the currently logged in user is an admin.
     */
    public static function isAdmin(): bool
    {
        if (self::isConsole()) {
            return true;
        }

        return \Craft::$app->getUser()->getIsAdmin();
    }

    private static function isConsole(): bool
    {
        return \Craft::$app->request->getIsConsoleRequest();
    }

    private static function permissionsEnabled(): bool
    {
        return \Craft::Pro === \Craft::$app->getEdition();
    }
}
