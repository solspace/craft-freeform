<?php

namespace Solspace\Freeform\Bundles\Permissions;

use craft\elements\User;

class PermissionsProvider
{
    public function getFirstPermissionId(string $name): ?int
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return null;
        }

        $name = strtolower($name);

        $permissionList = \Craft::$app->userPermissions->getPermissionsByUserId($user->getId());
        foreach ($permissionList as $permission) {
            if (str_starts_with($permission, $name)) {
                if (!str_contains($permission, ':')) {
                    continue;
                }

                [, $permissionId] = explode(':', $permission);

                return (int) $permissionId;
            }
        }

        return null;
    }

    public function isConsole(): bool
    {
        return \Craft::$app->request->getIsConsoleRequest();
    }

    public function getCurrentUser(): ?User
    {
        return \Craft::$app->getUser()->getIdentity();
    }

    public function permissionsEnabled(): bool
    {
        return \Craft::Pro === \Craft::$app->getEdition();
    }
}
