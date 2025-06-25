<?php

namespace Solspace\Freeform\Resources\Bundles;

class NotificationEditorBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/external/ace@1.41.0/ace.min.js',
            'js/external/ace@1.41.0/mode-twig.min.js',
            'js/external/ace@1.41.0/theme-textmate.min.js',
        ];
    }
}
