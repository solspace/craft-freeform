<?php

namespace Solspace\Freeform\Services\Headless\Profile;

class HeadlessProfile
{
    /**
     * @param array<string, array{type: string, required?: bool, source?: string}> $properties
     * @param string[]                                                             $allowedOrigins
     */
    public function __construct(
        public readonly string $name,
        public readonly string $formHandle,
        public readonly bool $requiresAuth = false,
        public readonly bool $requiresSignedToken = false,
        public readonly ?string $contextProviderClass = null,
        public readonly bool $allowSubmit = true,
        public readonly string $cache = 'no-store',
        public readonly array $properties = [],
        public readonly array $allowedOrigins = [],
    ) {}

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
