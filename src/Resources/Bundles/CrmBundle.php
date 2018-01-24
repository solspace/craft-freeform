<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class CrmBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/integrations.css'];
    }
}
