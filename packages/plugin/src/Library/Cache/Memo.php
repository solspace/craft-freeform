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
    public function get(string $key, callable $callable, ?string $prefix = null): mixed
    {
        if ($prefix) {
            $key = trim($prefix, '.').'.'.$key;
        }

        if (!\array_key_exists($key, $this->cache)) {
            $this->cache[$key] = $callable();
        }

        return $this->cache[$key];
    }

    public function clear(): void
    {
        $this->cache = [];
    }
}
