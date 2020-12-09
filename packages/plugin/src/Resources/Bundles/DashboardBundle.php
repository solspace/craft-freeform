<?php

namespace Solspace\Freeform\Resources\Bundles;

class DashboardBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return [
            'https://unpkg.com/tippy.js@6/themes/light-border.css',
            'https://unpkg.com/tippy.js@6/animations/scale.css',
            'css/cp/dashboard/dashboard.css',
            'css/shared/fonts.css',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'https://cdn.jsdelivr.net/npm/@shopify/draggable@1.0.0-beta.11/lib/sortable.js',
            'https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js',
            'https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js',
            'js/scripts/cp/dashboard/index.js',
            'js/scripts/cp/dashboard/features.js',
            'js/scripts/cp/dashboard/popups.js',
        ];
    }
}
