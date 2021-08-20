<?php

namespace Solspace\Freeform\Resources\Bundles;

class DiagnosticsBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return [
            'css/cp/settings/diagnostics.css',
        ];
    }
}
