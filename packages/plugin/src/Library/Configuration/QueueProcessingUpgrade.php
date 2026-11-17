<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Helpers\BooleanHelper;

class QueueProcessingUpgrade
{
    public const LEGACY_KEYS = ['useQueueForEmailNotifications', 'useQueueForIntegrations', 'useQueueForAiFields'];

    public static function settings(array $settings): array
    {
        $legacy = array_intersect_key($settings, array_flip(self::LEGACY_KEYS));
        if ($legacy && !\array_key_exists('useQueue', $settings)) {
            $variables = [];
            $enabled = false;
            foreach ($legacy as $value) {
                if (\is_string($value) && str_starts_with($value, '$')) {
                    $variables[] = $value;
                } else {
                    $enabled = $enabled || BooleanHelper::normalize($value);
                }
            }
            $variables = array_values(array_unique($variables));
            $settings['useQueue'] = $enabled ? 'true' : match (\count($variables)) {
                0 => 'false',
                1 => $variables[0],
                default => $variables,
            };
        }
        foreach (self::LEGACY_KEYS as $key) {
            unset($settings[$key]);
        }

        return $settings;
    }
}
