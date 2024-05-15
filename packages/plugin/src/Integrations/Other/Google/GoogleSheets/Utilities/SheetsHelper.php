<?php

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Utilities;

class SheetsHelper
{
    public static function getColumnLetter(int $columnIndex): string
    {
        $columnLetter = '';
        do {
            $columnLetter = \chr($columnIndex % 26 + 65).$columnLetter;
            $columnIndex = (int) ($columnIndex / 26) - 1;
        } while ($columnIndex >= 0);

        return $columnLetter;
    }

    public static function getA1(int $firstColumn, int $offset): string
    {
        $letter = self::getColumnLetter($firstColumn);
        $number = $offset + 1;

        return "{$letter}{$number}";
    }
}
