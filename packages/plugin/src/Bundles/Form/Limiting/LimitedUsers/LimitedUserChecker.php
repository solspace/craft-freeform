<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

use Solspace\Freeform\Bundles\Permissions\PermissionsProvider;

class LimitedUserChecker
{
    public function __construct(
        private PermissionsProvider $permissions,
        private LimitedUserSettingsProvider $settingsProvider,
    ) {}

    public function can(string $path, ?string $includes = null): bool
    {
        if ($this->permissions->isConsole()) {
            return true;
        }

        if (!$this->permissions->permissionsEnabled()) {
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

    public function get(string $path): array|bool|string|null
    {
        $user = $this->permissions->getCurrentUser();
        if ($user?->admin) {
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
        $user = $this->permissions->getCurrentUser();
        if ($user->admin) {
            return null;
        }

        return $this->getFirstPermissionSettings();
    }

    private function getFirstPermissionSettings(): ?array
    {
        static $id;

        if (null === $id) {
            $id = $this->permissions->getFirstPermissionId('freeform-limitedusers');
        }

        return $this->settingsProvider->getSettings($id);
    }
}
