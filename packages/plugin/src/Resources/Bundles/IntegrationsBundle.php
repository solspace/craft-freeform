<?php

namespace Solspace\Freeform\Resources\Bundles;

class IntegrationsBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/integrations/index.js',
            'js/scripts/cp/integrations/auth-check.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'css/cp/integrations/integrations.css',
            'css/cp/integrations/auth-check.css',
        ];
    }
}
