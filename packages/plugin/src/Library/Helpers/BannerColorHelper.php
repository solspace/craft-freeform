<?php

namespace Solspace\Freeform\Library\Helpers;

use Solspace\Freeform\Library\Attributes\Attributes;

class BannerColorHelper
{
    public static function apply(Attributes $attributes, ?string $color, bool $dark = false, string $treatment = 'soft'): void
    {
        $style = self::style($color, $dark, $treatment);
        if (null === $style) {
            return;
        }

        $attributes->replace('data-freeform-custom-banner-color', true);
        $existing = rtrim((string) $attributes->get('style', ''), "; \t\n\r\0\x0B");
        if (!str_ends_with($existing, $style)) {
            $attributes->replace('style', ($existing ? $existing.';' : '').$style);
        }
    }

    /** Derive readable banner and validation colors from a single chosen hue. */
    public static function colors(?string $color, bool $dark = false, string $treatment = 'soft'): ?array
    {
        if (!preg_match('/^#?([a-f0-9]{6}|[a-f0-9]{3})$/iD', trim($color ?? ''), $match)) {
            return null;
        }

        $hex = strtolower($match[1]);
        if (3 === \strlen($hex)) {
            $hex = implode('', array_map(static fn (string $c) => $c.$c, str_split($hex)));
        }
        $rgb = array_map('hexdec', str_split($hex, 2));
        if ('bold' === $treatment) {
            return [
                'background' => '#'.$hex,
                'border' => '#'.$hex,
                'text' => self::contrast([255, 255, 255], $rgb) >= 4.5 ? '#ffffff' : '#000000',
            ];
        }
        $background = $dark
            ? 'rgba('.implode(',', $rgb).',0.18)'
            : self::hex(array_map(static fn (int $c) => (int) round(255 * .9 + $c * .1), $rgb));
        $surface = $dark ? [31, 41, 55] : [255, 255, 255];
        $backgroundRgb = array_map(
            static fn (int $c, int $base) => (int) round($dark ? $c * .18 + $base * .82 : $c * .1 + 255 * .9),
            $rgb,
            $surface,
        );
        $textRgb = $rgb;
        for ($step = 0; $step <= 50; ++$step) {
            $mix = $step / 50;
            $textRgb = array_map(static fn (int $c) => (int) round($c * (1 - $mix) + ($dark ? 255 : 0) * $mix), $rgb);
            if (self::contrast($textRgb, $backgroundRgb) >= 4.5 && self::contrast($textRgb, $surface) >= 4.5) {
                break;
            }
        }
        $text = self::hex($textRgb);

        return ['background' => $background, 'border' => '#'.$hex, 'text' => $text];
    }

    public static function style(?string $color, bool $dark = false, string $treatment = 'soft'): ?string
    {
        $colors = self::colors($color, $dark, $treatment);
        if (null === $colors) {
            return null;
        }

        return '--ff-banner-text-color:'.$colors['text'].';background-color:'.$colors['background'].';border-color:'.$colors['border'].';color:'.$colors['text'];
    }

    public static function applyFieldColors(Attributes $attributes, ?string $color, bool $dark = false): void
    {
        $colors = self::colors($color, $dark);
        if (null === $colors) {
            return;
        }

        $attributes->replace('data-freeform-custom-error-color', true);
        $style = '--ff-error-color:'.$colors['border'].';--ff-error-text-color:'.$colors['text'];
        foreach (['--ff-color-danger', '--ff-signature-error', '--ff-character-count-error', '--color-error', '--bs-form-invalid-border-color'] as $variable) {
            $style .= ';'.$variable.':'.$colors['border'];
        }
        $style .= ';--bs-form-invalid-color:'.$colors['text'];
        $existing = rtrim((string) $attributes->get('style', ''), "; \t\n\r\0\x0B");
        if (!str_ends_with($existing, $style)) {
            $attributes->replace('style', ($existing ? $existing.';' : '').$style);
        }
    }

    private static function hex(array $rgb): string
    {
        return '#'.implode('', array_map(static fn (int $c) => str_pad(dechex($c), 2, '0', \STR_PAD_LEFT), $rgb));
    }

    private static function contrast(array $first, array $second): float
    {
        $luminance = static function (array $rgb): float {
            $channels = array_map(static function (int $channel): float {
                $value = $channel / 255;

                return $value <= .04045 ? $value / 12.92 : (($value + .055) / 1.055) ** 2.4;
            }, $rgb);

            return $channels[0] * .2126 + $channels[1] * .7152 + $channels[2] * .0722;
        };
        $a = $luminance($first);
        $b = $luminance($second);

        return (max($a, $b) + .05) / (min($a, $b) + .05);
    }
}
