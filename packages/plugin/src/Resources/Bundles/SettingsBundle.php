<?php

namespace Solspace\Freeform\Resources\Bundles;

class SettingsBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/settings/index.js'];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/settings/settings.css'];
    }
}
