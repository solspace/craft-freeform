<?php

namespace Solspace\Freeform\Library\Helpers;

class RecursiveArrayHelper
{
    public static function some(array $array, callable $fn): bool
    {
        foreach ($array as $value) {
            if (\is_array($value)) {
                if (static::some($value, $fn)) {
                    return true;
                }
            } else {
                if ($fn($value)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static function every(array $array, callable $fn): bool
    {
        foreach ($array as $value) {
            if (\is_array($value)) {
                if (!static::every($value, $fn)) {
                    return false;
                }
            } else {
                if (!$fn($value)) {
                    return false;
                }
            }
        }

        return true;
    }
}
