<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class StatisticsWidgetBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/widgets/statistics.css'];
    }
}
