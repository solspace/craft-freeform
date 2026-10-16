<?php

namespace Solspace\Freeform\Resources\Bundles;

class DiagnosticsBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/settings/diagnostics.js'];
    }

    public function getStylesheets(): array
    {
        return [
            'css/cp/settings/diagnostics.css',
        ];
    }
}
