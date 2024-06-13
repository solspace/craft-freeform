<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use craft\elements\User;
use Solspace\Freeform\Records\LimitedUsersRecord;

class LimitedUserChecker
{
    public function __construct() {}

    public function can(string $path, ?string $includes = null): bool
    {
        if ($this->isConsole()) {
            return true;
        }

        if (!$this->permissionsEnabled()) {
            return true;
        }

        $value = $this->get($path);
        if (null === $value) {
            return true;
        }

        if (null !== $includes && \is_array($value)) {
            return \in_array($includes, $value, true);
        }

        return (bool) $value;
    }

    public function get(string $path): null|array|bool|string
    {
        $user = $this->getCurrentUser();
        if ($user->admin) {
            return null;
        }

        $settings = $this->getFirstPermissionSettings();
        if (null === $settings) {
            return null;
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

        return $settings[$path] ?? null;
    }

    public function getAll(): ?array
    {
        $user = $this->getCurrentUser();
        if ($user->admin) {
            return null;
        }

        return $this->getFirstPermissionSettings();
    }

    private function getFirstPermissionSettings(): ?array
    {
        static $settings;

        if (null === $settings) {
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
                $settings = false;

                return null;
            }

            $record = LimitedUsersRecord::findOne(['id' => $id]);
            if (!$record) {
                $settings = false;

                return null;
            }

            $settings = json_decode($record->settings, true);
        }

        if (false === $settings) {
            return null;
        }

        return $settings;
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
