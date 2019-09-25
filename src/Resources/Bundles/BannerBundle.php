<?php
/**
 * Created by PhpStorm.
 * User: gustavs
 * Date: 06/09/2017
 * Time: 15:14
 */

namespace Solspace\Freeform\Resources\Bundles;

class BannerBundle extends AbstractFreeformAssetBundle
{
    /**
     * @return array
     */
    public function getScripts(): array
    {
        return ['js/other/components/banners.js'];
    }

    /**
     * @return array
     */
    public function getStylesheets(): array
    {
        return ['css/banners.css'];
    }
}
