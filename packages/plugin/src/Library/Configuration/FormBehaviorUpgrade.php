<?php

namespace Solspace\Freeform\Library\Configuration;

class FormBehaviorUpgrade
{
    public static function display(bool $spinner, bool $text, bool $overlay): string
    {
        return $overlay ? ($spinner || $text ? 'both' : 'overlay') : 'button';
    }

    public static function behavior(array $behavior): array
    {
        if (!isset($behavior['processingDisplay']) && (isset($behavior['showProcessingSpinner']) || isset($behavior['showProcessingText']) || isset($behavior['showProcessingOverlay']))) {
            $behavior['processingDisplay'] = self::display(
                (bool) ($behavior['showProcessingSpinner'] ?? false),
                (bool) ($behavior['showProcessingText'] ?? false),
                (bool) ($behavior['showProcessingOverlay'] ?? false),
            );
        }
        unset($behavior['focusFirstError'], $behavior['showProcessingSpinner'], $behavior['showProcessingText'], $behavior['showProcessingOverlay']);

        return $behavior;
    }

    public static function metadata(array $metadata): array
    {
        $metadata['behavior'] = self::behavior($metadata['behavior'] ?? []);

        return $metadata;
    }

    public static function settings(array $settings): array
    {
        unset($settings['formSubmitDisable'], $settings['defaults']['props']['signature']['clear']);
        if (isset($settings['defaults']['settings']['processing'])) {
            $processing = &$settings['defaults']['settings']['processing'];
            if (!isset($processing['processingDisplay']) && (isset($processing['showIndicator']) || isset($processing['showText']) || isset($processing['showOverlay']))) {
                $processing['processingDisplay'] = [
                    'value' => self::display(
                        (bool) ($processing['showIndicator']['value'] ?? true),
                        (bool) ($processing['showText']['value'] ?? true),
                        (bool) ($processing['showOverlay']['value'] ?? false),
                    ),
                    'locked' => (bool) ($processing['showIndicator']['locked'] ?? false) || (bool) ($processing['showText']['locked'] ?? false) || (bool) ($processing['showOverlay']['locked'] ?? false),
                ];
            }
            unset($processing['focusFirstError'], $processing['showIndicator'], $processing['showText'], $processing['showOverlay'], $processing);
        }

        return $settings;
    }
}
