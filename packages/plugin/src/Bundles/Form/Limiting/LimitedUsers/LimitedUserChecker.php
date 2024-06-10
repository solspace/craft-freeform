<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use craft\elements\User;
use Solspace\Freeform\Records\LimitedUsersRecord;

class LimitedUserChecker
{
    public function __construct() {}

    public function can(string $path): bool
    {
        if ($this->isConsole()) {
            return true;
        }

        if (!$this->permissionsEnabled()) {
            return true;
        }

        $user = $this->getCurrentUser();
        if ($user->admin) {
            return true;
        }

        $settings = $this->getFirstPermissionSettings();
        if (null === $settings) {
            return true;
        }

        $parts = explode('.', $path);
        for ($i = 0; $i < \count($parts); ++$i) {
            $currentChain = implode('.', \array_slice($parts, 0, $i + 1));

            if (\array_key_exists($currentChain, $settings)) {
                if (false === $settings[$currentChain]) {
                    return false;
                }
            }
        }

        return $settings[$path] ?? true;
    }

    // TODO: cache this result
    private function getFirstPermissionSettings(): ?array
    {
        $permissionName = 'freeform-limitedusers';
        $id = null;

        $user = $this->getCurrentUser();
        $permissionList = \Craft::$app->userPermissions->getPermissionsByUserId($user->getId());
        foreach ($permissionList as $permission) {
            if (str_starts_with($permission, $permissionName)) {
                if (!str_contains($permission, ':')) {
                    continue;
                }

                [, $permissionId] = explode(':', $permission);

                $id = $permissionId;

                break;
            }
        }

        if (!$id) {
            return null;
        }

        $record = LimitedUsersRecord::findOne(['id' => $id]);
        if (!$record) {
            return null;
        }

        return json_decode($record->settings, true);
    }

    private function isConsole(): bool
    {
        return \Craft::$app->request->getIsConsoleRequest();
    }

    private function getCurrentUser(): ?User
    {
        return \Craft::$app->getUser()->getIdentity();
    }

    private function permissionsEnabled(): bool
    {
        return \Craft::Pro === \Craft::$app->getEdition();
    }
}
