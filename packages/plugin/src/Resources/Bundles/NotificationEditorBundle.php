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
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-html.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/theme-github.min.js',
        ];
    }
}
