<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

final class CallbackOrigin
{
    public static function matches(string $callback, string $origin): bool
    {
        $normalize = static function (string $url): ?array {
            $parts = parse_url($url);
            if (!$parts || !isset($parts['scheme'], $parts['host']) || isset($parts['user']) || isset($parts['pass'])) {
                return null;
            }
            $scheme = strtolower($parts['scheme']);
            if (!\in_array($scheme, ['http', 'https'], true)) {
                return null;
            }

            return [$scheme, strtolower($parts['host']), $parts['port'] ?? ('https' === $scheme ? 443 : 80)];
        };
        $callbackOrigin = $normalize($callback);

        return null !== $callbackOrigin && $callbackOrigin === $normalize($origin);
    }
}
