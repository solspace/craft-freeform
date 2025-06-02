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

    public function isLockedWithGuard(string $cacheKey, string $lockKey, int $interval): bool
    {
        $cache = \Craft::$app->getCache();
        $mutex = \Craft::$app->getMutex();

        $now = time();

        $lastRun = (int) $cache->get($cacheKey);

        // Bail out if it's already locked / too soon
        if ($lastRun && ($now - $lastRun) < $interval) {
            return true;
        }

        // Try to acquire mutex to double-check under safe conditions
        if ($mutex->acquire($lockKey, 0)) {
            try {
                $lastRun = (int) $cache->get($cacheKey);
                if ($lastRun && ($now - $lastRun) < $interval) {
                    return true;
                }

                // Set the cache now so other processes back off
                $cache->set($cacheKey, $now, $interval);

                return false;
            } finally {
                $mutex->release($lockKey);
            }
        }

        // If mutex is not available, assume it's locked
        return true;
    }
}
