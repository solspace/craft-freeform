<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\assets\cp\CpAsset;
use yii\web\AssetBundle;

class IntegrationsBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/integrations.js'];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/integrations.css'];
    }
}
