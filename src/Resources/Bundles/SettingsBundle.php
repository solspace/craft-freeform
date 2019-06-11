<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class SettingsBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/settings.js'];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/settings.css'];
    }
}
