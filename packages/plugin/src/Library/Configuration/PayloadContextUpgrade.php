<?php

namespace Solspace\Freeform\Library\Configuration;

class PayloadContextUpgrade
{
    public const RETIRED_KEYS = ['sessionContext', 'sessionContextTimeToLiveMinutes', 'sessionContextCount', 'sessionEntryMaxCount', 'sessionEntryTTL'];

    public static function settings(array $settings): array
    {
        foreach (self::RETIRED_KEYS as $key) {
            unset($settings[$key]);
        }

        return $settings;
    }
}
