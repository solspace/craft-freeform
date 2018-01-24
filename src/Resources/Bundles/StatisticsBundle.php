<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\assets\cp\CpAsset;
use yii\web\AssetBundle;

class StatisticsBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/main.css'];
    }
}
