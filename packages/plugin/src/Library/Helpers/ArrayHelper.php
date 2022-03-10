<?php

namespace Solspace\Freeform\Library\Helpers;

class ArrayHelper
{
    /**
     * Returns true if any one element in the array passes the callable check.
     */
    public static function some(array $array, callable $fn): bool
    {
        foreach ($array as $value) {
            if ($fn($value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if every element in the $array returns true on the callback call.
     */
    public static function every(array $array, callable $fn): bool
    {
        foreach ($array as $value) {
            if (!$fn($value)) {
                return false;
            }
        }

        return true;
    }
}
