<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\enums\Color;

class ColorHelper
{
    /**
     * Generates a random HEX color code.
     */
    public static function randomColor(): string
    {
        return \sprintf('#%06X', mt_rand(0, 0xFFFFFF));
    }

    /**
     * Determines if the contrasting color to be used based on a HEX color code.
     */
    public static function getContrastYIQ(string $hexColor): string
    {
        $hexColor = str_replace('#', '', $hexColor);

        $r = hexdec(substr($hexColor, 0, 2));
        $g = hexdec(substr($hexColor, 2, 2));
        $b = hexdec(substr($hexColor, 4, 2));
        $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

        return ($yiq >= 128) ? 'black' : 'white';
    }

    /**
     * Generates an RGB color based on $id int or hex string.
     */
    public static function getRGBColor(int|string $id): array
    {
        if (str_starts_with($id, '#')) {
            $hash = substr($id, 1, 6);
        } else {
            $hash = md5($id); // modify 'color' to get a different palette
        }

        return [
            hexdec(substr($hash, 0, 2)), // r
            hexdec(substr($hash, 2, 2)), // g
            hexdec(substr($hash, 4, 2)), // b
        ];
    }

    public static function getCraftColor(string $statusColor): Color|string
    {
        $isCraft5 = version_compare(\Craft::$app->getVersion(), '5', '>=');

        if ($isCraft5) {
            return match ($statusColor) {
                'red' => Color::Red,
                'orange' => Color::Orange,
                'amber' => Color::Amber,
                'rose' => Color::Rose,
                'pink' => Color::Pink,
                'lime' => Color::Lime,
                'emerald' => Color::Emerald,
                'teal' => Color::Teal,
                'green' => Color::Green,
                'yellow' => Color::Yellow,
                'violet' => Color::Violet,
                'indigo' => Color::Indigo,
                'fuchsia' => Color::Fuchsia,
                'purple' => Color::Purple,
                'cyan' => Color::Cyan,
                'sky' => Color::Sky,
                'blue' => Color::Blue,
                'gray' => Color::Gray,
                'white' => Color::White,
                'black' => Color::Black,
                default => Color::Gray,
            };
        }

        return $statusColor;
    }
}
