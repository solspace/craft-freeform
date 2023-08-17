<?php

namespace Solspace\Freeform\Resources\Bundles;

class SubmissionIndexBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/submissions/index.js',
            'js/scripts/cp/submissions/element-index.js',
            'js/scripts/cp/submissions/element-table-view.js',
            'js/scripts/cp/submissions/actions/send-notification.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'css/cp/submissions/charts-explorer.css',
            'css/cp/submissions/index.css',
        ];
    }
}
