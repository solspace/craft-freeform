<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class FormIndexBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return ['css/form-index.css'];
    }

    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/form-index.js'];
    }
}
