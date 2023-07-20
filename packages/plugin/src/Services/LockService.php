<?php

namespace Solspace\Freeform\Services;

class LockService
{
    public function isLocked(string $key, int $seconds): bool
    {
        $cacheService = \Craft::$app->getCache();

        if (!$cacheService->exists($key)) {
            $cacheService->set($key, $key, $seconds);

            return false;
        }

        return true;
    }
}
