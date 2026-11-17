<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Models\Settings;

class UploadRetentionUpgrade
{
    public static function settings(array $settings): array
    {
        if (\array_key_exists('purgeAssets', $settings)) {
            $settings['purgableUnfinalizedAssetAgeInMinutes'] = BooleanHelper::normalize($settings['purgeAssets'])
                ? ($settings['purgableUnfinalizedAssetAgeInMinutes'] ?? Settings::DEFAULT_UNFINALIZED_ASSET_AGE_MINUTES)
                : 0;
            unset($settings['purgeAssets']);
        }

        return $settings;
    }
}
