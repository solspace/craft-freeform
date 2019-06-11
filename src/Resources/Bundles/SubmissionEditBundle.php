<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class SubmissionEditBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return ['js/other/submissions.js'];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/submissions.css'];
    }
}
