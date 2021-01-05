<?php

namespace Solspace\Freeform\Resources\Bundles;

class ExportButtonBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/export-profiles/export-button.js'];
    }
}
