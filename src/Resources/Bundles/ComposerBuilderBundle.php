<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class ComposerBuilderBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return [
            'js/composer/vendors.js',
            'js/composer/app.js',
        ];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/builder.css'];
    }
}
