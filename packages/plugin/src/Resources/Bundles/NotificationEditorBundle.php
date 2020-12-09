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
            'js/lib/ace/ace.js',
            'js/lib/ace/mode-html.js',
            'js/lib/ace/theme-github.js',
        ];
    }
}
