<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Helpers\BooleanHelper;

class TwigAccessUpgrade
{
    public const MODES = ['disabled', 'form', 'craft'];

    public static function defaults(array $defaults): array
    {
        if (!isset($defaults['twigAccess']) && (\array_key_exists('twigInHtml', $defaults) || \array_key_exists('twigIsolation', $defaults))) {
            $enabled = BooleanHelper::normalize($defaults['twigInHtml'] ?? true);
            $isolated = BooleanHelper::normalize($defaults['twigIsolation'] ?? true);
            $defaults['twigAccess'] = !$enabled ? 'disabled' : ($isolated ? 'form' : 'craft');
        }
        unset($defaults['twigInHtml'], $defaults['twigIsolation']);

        return $defaults;
    }

    public static function settings(array $settings): array
    {
        if (isset($settings['defaults']) && \is_array($settings['defaults'])) {
            $settings['defaults'] = self::defaults($settings['defaults']);
        }

        return $settings;
    }
}
