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
        return [
            'https://unpkg.com/tippy.js@6/themes/light-border.css',
            'https://unpkg.com/tippy.js@6/animations/scale.css',
            'css/dashboard.css'
        ];
    }

    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return [
            'https://cdn.jsdelivr.net/npm/@shopify/draggable@1.0.0-beta.11/lib/sortable.js',
            'https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js',
            'https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js',
            'js/other/dashboard/index.js',
            'js/other/dashboard/features.js',
            'js/other/dashboard/popups.js',
        ];
    }
}
