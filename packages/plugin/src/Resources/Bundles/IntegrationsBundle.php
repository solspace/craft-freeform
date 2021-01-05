<?php

namespace Solspace\Freeform\Resources\Bundles;

class IntegrationsBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/integrations/index.js'];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/integrations/integrations.css'];
    }
}
