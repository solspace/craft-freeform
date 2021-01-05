<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 06/09/2017
 * Time: 15:14.
 */

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
