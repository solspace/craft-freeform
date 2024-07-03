<?php

namespace Solspace\Freeform\Library\Helpers;

class StringHelper
{
    public static function incrementStringWithNumber(string $string, bool $hasSpacedNumber = false): string
    {
        $matches = [];
        preg_match('/^(.*?)(\d+)?$/', $string, $matches);

        $string = $matches[1];
        $number = $matches[2] ?? 0;

        if (0 === $number && $hasSpacedNumber) {
            $string .= ' ';
        }

        return $string.++$number;
    }

    /**
     * Replaces all of "{someKey}" occurrences in $string
     * with their respective value counterparts from $values array.
     */
    public static function replaceValues(string $string, array $values): string
    {
        foreach (self::flattenArrayValues($values) as $key => $value) {
            $string = (string) preg_replace("/\\{{$key}\\}/", $value, $string);
        }

        return $string;
    }

    public static function flattenArrayValues(array $values): array
    {
        $return = [];

        foreach ($values as $key => $value) {
            if (\is_array($value)) {
                $value = implode(', ', $value);
            }

            $return[$key] = $value;
        }

        return $return;
    }

    /**
     * Splits an underscored of camel cased string into separate words.
     */
    public static function humanize(string $string): string
    {
        return strtolower(trim(preg_replace(['/([A-Z])/', '/[_\\s]+/'], ['_$1', ' '], $string)));
    }

    /**
     * Turns every first letter in every word in the string into a camel cased letter.
     */
    public static function camelize(string $string, string $delimiter = ' '): string
    {
        $stringParts = explode($delimiter, $string);
        $camelized = array_map('ucwords', $stringParts);

        return implode($delimiter, $camelized);
    }

    /**
     * Walk through the array and create an HTML tag attribute string.
     */
    public static function compileAttributeStringFromArray(array $array): string
    {
        $attributeString = '';

        foreach ($array as $key => $value) {
            if (null === $value || (\is_bool($value) && $value)) {
                $attributeString .= " {$key}";
            } elseif (!\is_bool($value)) {
                $attributeString .= " {$key}=\"{$value}\"";
            }
        }

        return $attributeString ? $attributeString : '';
    }

    /**
     * Takes any items separated by a whitespace or any of the following `|,;` in a string
     * And returns an array of the items.
     */
    public static function extractSeparatedValues(string $string): array
    {
        preg_match_all('/"([^"]+)"|\'([^\']+)\'|([^ \t\r\n,|;]+)/', $string, $matches);

        // Flatten the matches array and filter out empty values
        $items = [];
        foreach ($matches[0] as $match) {
            if (!empty($match)) {
                $items[] = $match;
            }
        }

        $items = array_filter($items);
        $items = array_unique($items);

        return array_values($items);
    }

    public static function implodeRecursively(string $glue, array|string $data): string
    {
        if (!\is_array($data)) {
            return $data;
        }

        $pieces = [];
        foreach ($data as $item) {
            if (\is_array($item)) {
                $pieces[] = self::implodeRecursively($glue, $item);
            } else {
                $pieces[] = $item;
            }
        }

        return implode($glue, $pieces);
    }

    public static function isTwigValue($value): bool
    {
        return preg_match("/({{\\s.*\\s*}}\n?)/", $value);
    }

    public static function isEnvVariable(mixed $value): bool
    {
        if (!\is_string($value)) {
            return false;
        }

        return (bool) preg_match('/^\$([A-Z0-9_]+)$/i', $value);
    }
}
