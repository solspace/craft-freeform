<?php

/**
 * Example Craft config for Freeform headless API (alpha).
 * Copy relevant sections into config/freeform.php in your Craft project.
 */
return [
    'headless' => [
        // Master switch — headless endpoints return 404 when false.
        'enabled' => true,

        // Merged with per-form and per-profile origins for CORS (supports `*` wildcards).
        'allowedOrigins' => [
            'http://localhost:3000',
            'https://*.example.com',
        ],

        // Per-form headless exposure (keyed by form handle).
        'forms' => [
            'contact' => [
                'exposeManifest' => true,
                'allowSubmit' => true,
                // Optional per-form CORS override (merged with global allowedOrigins).
                'allowedOrigins' => [],
            ],
        ],

        /*
         * Submit security (read from manifest data.security):
         *
         * - CSRF: GET /freeform/tokens, send as X-CSRF-Token header (JSON) or form field (multipart).
         * - Honeypot / JS test: include empty values in submit `meta`:
         *     meta.honeypot = { name, value: "" }
         *     meta.javascriptTest = { name, value: "" }
         * - Captchas: include provider tokens in submit `meta`:
         *     meta.captchas = [{ name: "h-captcha-response", value: "..." }, ...]
         *   or meta.captcha = { name, value } for a single provider (GraphQL-compatible).
         * Disable captchas per form in CP when testing locally without provider tokens.
         */

        // Named manifest profiles (explicit, never inferred from integrations).
        'profiles' => [
            'event-edit' => [
                'form' => 'event',
                'requiresAuth' => true,
                'requiresSignedToken' => false,
                'contextProvider' => null, // EventEditContext::class
                'allowSubmit' => true,
                'cache' => 'private, no-store',
                'allowedOrigins' => ['https://app.example.com'],
                'properties' => [
                    'eventId' => [
                        'type' => 'integer',
                        'required' => true,
                        'source' => 'query',
                    ],
                ],
            ],
        ],
    ],
];
