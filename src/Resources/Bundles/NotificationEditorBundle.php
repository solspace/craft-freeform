<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class NotificationEditorBundle extends AbstractFreeformAssetBundle
{
    /**
     * @inheritDoc
     */
    public function getScripts(): array
    {
        return [
            'js/cp/ace/ace.js',
            'js/cp/ace/mode-html.js',
            'js/cp/ace/theme-github.js',
        ];
    }
}
