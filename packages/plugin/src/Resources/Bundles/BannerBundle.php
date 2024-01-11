<?php

namespace Solspace\Freeform\Resources\Bundles;

class BannerBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/dashboard/banners.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/dashboard/banners.css'];
    }
}
