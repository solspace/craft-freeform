<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Library\DataObjects\Summary\Statistics;

class SanitizeHelper
{
    public static function recursiveHtmlSpecialChars($value)
    {
        $isObject = is_object($value);
        if ($isObject) {
            $value = (array) $value;
        }

        if (!is_string($value) && !is_array($value)) {
            return $value;
        }

        if (is_array($value)) {
            $return = [];
            foreach ($value as $key => $val) {
                $return[$key] = self::recursiveHtmlSpecialChars($val);
            }

            if ($isObject) {
                $return = (object) $return;
            }

            return $return;
        }

        return htmlspecialchars($value, ENT_QUOTES);
    }

    public static function cleanUpTwigCondition(string $condition)
    {
        $disallowed = ['{', '}', ' and ', ' or ', ' && ', ' || '];
        $condition = str_replace($disallowed, '', $condition);

        $condition = preg_replace('/(^|\s|\(|\|)craft\.?/', '', $condition);

        return $condition;
    }
}
