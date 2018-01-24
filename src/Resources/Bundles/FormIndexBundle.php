<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class FormIndexBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/cp/form-index.js'];
    }
}
