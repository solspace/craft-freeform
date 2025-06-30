<?php

namespace Solspace\Freeform\Resources\Bundles;

class SettingsBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/settings/index.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/settings/settings.css'];
    }
}
