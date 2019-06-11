<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class SubmissionIndexBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return [
            'js/other/submissions.js',
            'js/other/freeform-submissions-index.js',
            'js/other/freeform-submissions-table-view.js',
        ];
    }

    /**
     * @inheritDoc
     */
    public function getStylesheets(): array
    {
        return ['css/charts-explorer.css'];
    }
}
