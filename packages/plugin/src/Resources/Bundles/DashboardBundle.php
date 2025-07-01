<?php

namespace Solspace\Freeform\Resources\Bundles;

class DashboardBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return [
            'js/external/tippy.js@6/themes/light-border.css',
            'js/external/tippy.js@6/animations/scale.css',
            'css/cp/dashboard/dashboard.css',
            'css/shared/fonts.css',
        ];
    }

    public function getScripts(): array
    {
        return [
            'js/external/amcharts@4/core.js',
            'js/external/amcharts@4/charts.js',
            'js/external/amcharts@4/themes/animated.js',
            'js/external/draggable@1.0.0/lib/sortable.js',
            'js/external/popperjs@2/dist/umd/popper.min.js',
            'js/external/tippy.js@6/dist/tippy-bundle.umd.js',
            'js/scripts/cp/dashboard/index.js',
            'js/scripts/cp/dashboard/features.js',
            'js/scripts/cp/dashboard/popups.js',
        ];
    }
}
