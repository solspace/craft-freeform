<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class LogBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/logs.css'];
    }

    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/logs/log.js'];
    }
}
