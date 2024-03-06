<?php

namespace Solspace\Freeform\Library\Helpers;

class ComparisonHelper
{
    public static function stringContainsWildcardKeyword(string $pattern, string $string): bool
    {
        if (str_contains($pattern, '"')) {
            // The double quotes becomes the delimiters
            $pattern = self::wildcardToRegex($pattern).'i';
        } else {
            $pattern = '#\b'.self::wildcardToRegex($pattern).'\b#i';
        }

        return (bool) preg_match($pattern, $string);
    }

    public static function stringMatchesWildcard(string $wildcardPattern, string $string): bool
    {
        $pattern = '#^'.self::wildcardToRegex($wildcardPattern).'$#iu';

        return (bool) preg_match($pattern, $string);
    }

    private static function wildcardToRegex(string $wildcardPattern, string $delimiter = '/'): string
    {
        $converted = preg_quote($wildcardPattern, $delimiter);

        return str_replace(['\*', '\+'], ['.*', '\+?'], $converted);
    }
}
