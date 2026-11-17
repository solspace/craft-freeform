<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Helpers\BooleanHelper;

class ExportFormatting
{
    public const CHOICES = [
        'headings' => ['labels', 'handles'],
        'options' => ['labels', 'values'],
        'multiline' => ['preserve', 'singleLine'],
        'tracking' => ['exclude', 'include'],
    ];

    public const DEFAULTS = [
        'headings' => 'labels',
        'options' => 'labels',
        'multiline' => 'preserve',
        'tracking' => 'exclude',
    ];

    public const LEGACY_KEYS = ['removeNewlines', 'exportLabels', 'exportHandlesAsNames', 'exportTrackedUrlParameters'];

    public static function normalize(mixed $formatting): array
    {
        if (\is_string($formatting)) {
            $formatting = json_decode($formatting, true);
        }
        $result = self::DEFAULTS;
        foreach (self::CHOICES as $key => $choices) {
            if (\is_array($formatting) && \in_array($formatting[$key] ?? null, $choices, true)) {
                $result[$key] = $formatting[$key];
            }
        }

        return $result;
    }

    public static function isValid(mixed $formatting): bool
    {
        if (!\is_array($formatting) || array_diff_key($formatting, self::CHOICES)) {
            return false;
        }
        foreach (self::CHOICES as $key => $choices) {
            if (!\in_array($formatting[$key] ?? null, $choices, true)) {
                return false;
            }
        }

        return true;
    }

    public static function fromLegacySettings(array $settings): array
    {
        return [
            'headings' => BooleanHelper::normalize($settings['exportHandlesAsNames'] ?? false) ? 'handles' : 'labels',
            'options' => BooleanHelper::normalize($settings['exportLabels'] ?? false) ? 'labels' : 'values',
            'multiline' => BooleanHelper::normalize($settings['removeNewlines'] ?? false) ? 'singleLine' : 'preserve',
            'tracking' => BooleanHelper::normalize($settings['exportTrackedUrlParameters'] ?? false) ? 'include' : 'exclude',
        ];
    }

    public static function removeLegacySettings(array $settings): array
    {
        return array_diff_key($settings, array_flip(self::LEGACY_KEYS));
    }
}
