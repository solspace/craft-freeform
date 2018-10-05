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
            'js/lib/ace/ace.js',
            'js/lib/ace/mode-html.js',
            'js/lib/ace/theme-github.js',
        ];
    }
}
