<?php

namespace Solspace\Freeform\Resources\Bundles;

class IntegrationsEditBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/integrations/edit.js'];
    }

    public function getStylesheets(): array
    {
        return [];
    }
}
