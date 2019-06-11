<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class CodepackBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/code-pack.js'];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/code-pack.css'];
    }
}
