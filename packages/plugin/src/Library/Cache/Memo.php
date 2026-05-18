<?php

namespace Solspace\Freeform\Library\Cache;

/**
 * A simple memoization class that allows caching the results of expensive function calls
 * and returning the cached result when the same inputs occur again.
 *
 * @template T
 */
class Memo
{
    /** @var array<string, T> */
    private array $cache = [];

    /**
     * @return T
     */
    public function get(string $key, ?string $prefix = null, mixed $defaultValue = null): mixed
    {
        $key = $this->getCacheKey($key, $prefix);

        return $this->cache[$key] ?? $defaultValue;
    }

    /**
     * @return T
     */
    public function getOrSet(string $key, callable $callable, ?string $prefix = null): mixed
    {
        $key = $this->getCacheKey($key, $prefix);

        if (!\array_key_exists($key, $this->cache)) {
            $this->cache[$key] = $callable();
        }

        return $this->cache[$key];
    }

    public function set(string $key, mixed $value, ?string $prefix = null): void
    {
        $key = $this->getCacheKey($key, $prefix);
        $this->cache[$key] = $value;
    }

    public function clear(): void
    {
        $this->cache = [];
    }

    private function getCacheKey(string $key, ?string $prefix = null): string
    {
        if ($prefix) {
            return trim($prefix, '.').'.'.$key;
        }

        return $key;
    }
}
