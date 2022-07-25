<?php

namespace Solspace\Freeform\Resources\Bundles;

class NotificationEditorBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/external/ace@1.4.12/ace.min.js',
            'js/external/ace@1.4.12/mode-html.min.js',
            'js/external/ace@1.4.12/theme-github.min.js',
        ];
    }
}
