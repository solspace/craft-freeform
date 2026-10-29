<?php

namespace Solspace\Freeform\Resources\Bundles;

class ActivityBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/activity/index.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/activity/activity.css'];
    }
}
