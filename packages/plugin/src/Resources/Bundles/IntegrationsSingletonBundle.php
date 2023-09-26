<?php

namespace Solspace\Freeform\Resources\Bundles;

class IntegrationsSingletonBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/scripts/cp/integrations/edit.js',
            'js/scripts/cp/integrations/singleton-edit.js',
        ];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/integrations/singleton.css'];
    }
}
