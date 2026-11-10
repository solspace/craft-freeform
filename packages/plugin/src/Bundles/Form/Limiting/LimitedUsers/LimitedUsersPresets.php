<?php

namespace Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers;

/** Shared with the client preset picker so setup profiles use the same permissions. */
class LimitedUsersPresets
{
    public static function settings(array $items, string $presetId, bool $uploads = false): array
    {
        $definitions = json_decode(file_get_contents(__DIR__.'/presets.json'), true, 512, \JSON_THROW_ON_ERROR);
        $presets = array_column($definitions['presets'], null, 'id');
        $preset = $presets[$presetId] ?? throw new \InvalidArgumentException('Invalid permission preset.');
        $options = $preset['options'];
        if ($uploads && 'simplified-building' === $presetId) {
            foreach ($definitions['uploadOptions'] as $path => $extra) {
                $options[$path] = array_merge($options[$path] ?? [], $extra);
            }
        }

        $settings = [];
        $visit = static function (array $item, string $prefix, bool $parentEnabled) use (&$visit, &$settings, $preset, $options): void {
            $path = $prefix ? $prefix.'.'.$item['id'] : $item['id'];
            $enabled = $parentEnabled;
            if ('boolean' === $item['type']) {
                $enabled = $parentEnabled && ($preset['fullAccess'] || \in_array($path, $preset['permissions'], true));
                $settings[$path] = $enabled;
            } elseif ('toggles' === $item['type']) {
                $allowed = $options[$path] ?? [];
                $settings[$path] = $parentEnabled ? array_values(array_filter(
                    array_column($item['options'], 'value'),
                    static fn ($value) => $preset['fullAccess'] || '*' === $allowed || \in_array($value, $allowed, true),
                )) : [];
            } elseif ('select' === $item['type']) {
                $settings[$path] = $item['value'];
            }
            foreach ($item['children'] ?? [] as $child) {
                $visit($child, $path, $enabled);
            }
        };
        foreach ($items as $item) {
            $visit($item, '', true);
        }

        return $settings;
    }
}
