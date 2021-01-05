<?php

namespace Solspace\Freeform\Resources\Bundles;

class SubmissionIndexBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/submissions/index.js',
            'js/scripts/cp/submissions/element-index.js',
            'js/scripts/cp/submissions/element-table-view.js',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return [
            'css/cp/submissions/charts-explorer.css',
            'css/cp/submissions/index.css',
        ];
    }
}
