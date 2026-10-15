<?php

namespace Solspace\Freeform\Library\Helpers;

class PreviewAssetHelper
{
    public static function parse(string $value): array
    {
        if (\strlen($value) > 45000) {
            throw new \InvalidArgumentException('Preview asset configuration is too long.');
        }
        $urls = array_values(array_unique(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $value)), static fn ($url) => '' !== $url)));
        if (\count($urls) > 20) {
            throw new \InvalidArgumentException('Enter no more than 20 asset URLs per field.');
        }

        foreach ($urls as $url) {
            if (!self::isAllowed($url)) {
                throw new \InvalidArgumentException('Enter absolute HTTPS asset URLs without credentials or fragments, one per line.');
            }
        }

        return $urls;
    }

    public static function isAllowed(string $url): bool
    {
        if (\strlen($url) > 2048 || preg_match('/[\s\x00-\x1f\x7f\x27\x22<>;]/', $url) || !filter_var($url, \FILTER_VALIDATE_URL)) {
            return false;
        }

        $parts = parse_url($url);

        return 'https' === ($parts['scheme'] ?? null)
            && !empty($parts['host'])
            && !isset($parts['user'])
            && !isset($parts['pass'])
            && !isset($parts['fragment']);
    }
}
