<?php

namespace Solspace\Freeform\Library\Helpers;

class CharacterCountHelper
{
    public static function count(string $value): int
    {
        // Match native input/textarea maxlength: UTF-16 units and LF newlines.
        $value = str_replace(["\r\n", "\r"], "\n", $value);

        return (int) (\strlen(mb_convert_encoding($value, 'UTF-16LE', 'UTF-8')) / 2);
    }
}
