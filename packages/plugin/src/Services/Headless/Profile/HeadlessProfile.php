<?php

namespace Solspace\Freeform\Services\Headless\Profile;

/**
 * Read-only profile values with PHP 8.0-compatible accessors.
 *
 * @property string  $name
 * @property string  $formHandle
 * @property bool    $requiresAuth
 * @property bool    $requiresSignedToken
 * @property ?string $contextProviderClass
 * @property bool    $allowSubmit
 * @property string  $cache
 * @property array   $properties
 * @property array   $allowedOrigins
 */
class HeadlessProfile
{
    /**
     * @param array<string, array{type: string, required?: bool, source?: string}> $properties
     * @param string[]                                                             $allowedOrigins
     */
    public function __construct(
        private string $name,
        private string $formHandle,
        private bool $requiresAuth = false,
        private bool $requiresSignedToken = false,
        private ?string $contextProviderClass = null,
        private bool $allowSubmit = true,
        private string $cache = 'no-store',
        private array $properties = [],
        private array $allowedOrigins = [],
    ) {}

    public function __get(string $name): mixed
    {
        if (!property_exists($this, $name)) {
            throw new \Error('Undefined property: '.self::class.'::$'.$name);
        }

        return $this->{$name};
    }

    public function __isset(string $name): bool
    {
        return property_exists($this, $name) && null !== $this->{$name};
    }

    public function __set(string $name, mixed $value): void
    {
        throw new \Error('Cannot modify readonly property '.self::class.'::$'.$name);
    }

    public function __unset(string $name): void
    {
        throw new \Error('Cannot unset readonly property '.self::class.'::$'.$name);
    }

    /**
     * @param array<string, mixed> $config
     */
    public static function fromConfig(string $name, array $config): self
    {
        return new self(
            name: $name,
            formHandle: (string) ($config['form'] ?? ''),
            requiresAuth: (bool) ($config['requiresAuth'] ?? false),
            requiresSignedToken: (bool) ($config['requiresSignedToken'] ?? false),
            contextProviderClass: isset($config['contextProvider']) ? (string) $config['contextProvider'] : null,
            allowSubmit: (bool) ($config['allowSubmit'] ?? true),
            cache: (string) ($config['cache'] ?? 'no-store'),
            properties: \is_array($config['properties'] ?? null) ? $config['properties'] : [],
            allowedOrigins: \is_array($config['allowedOrigins'] ?? null) ? $config['allowedOrigins'] : [],
        );
    }
}
