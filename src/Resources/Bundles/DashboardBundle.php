<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class DashboardBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/dashboard.css'];
    }

    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/dashboard/integrations.js'];
    }
}
