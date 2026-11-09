<?php

namespace Solspace\Freeform\Resources\Bundles;

class ActivityBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/external/highlightjs@11.11.1/highlight.min.js',
            'js/external/highlightjs@11.11.1/json.min.js',
            'js/scripts/cp/activity/index.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'js/external/highlightjs@11.11.1/github.min.css',
            'css/cp/activity/activity.css',
        ];
    }
}
