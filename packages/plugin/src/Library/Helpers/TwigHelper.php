<?php

namespace Solspace\Freeform\Library\Helpers;

class TwigHelper
{
    public static function isTwigValue($value): bool
    {
        if (!\is_string($value)) {
            return false;
        }

        return preg_match("/({{\\s.*\\s*}}\n?)/", $value);
    }
}
