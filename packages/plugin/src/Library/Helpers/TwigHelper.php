<?php

namespace Solspace\Freeform\Library\Helpers;

class TwigHelper
{
    public static function isTwigValue($value): bool
    {
        return preg_match("/({{\\s.*\\s*}}\n?)/", $value);
    }
}
