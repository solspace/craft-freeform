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

    public static function dashesToCamelCase(?string $string, bool $capitalizeFirstCharacter = false): ?string
    {
        if ($string && str_contains($string, '-')) {
            $string = str_replace('-', '', ucwords($string, '-'));

            if (!$capitalizeFirstCharacter) {
                $string = lcfirst($string);
            }
        }

        return $string;
    }
}
