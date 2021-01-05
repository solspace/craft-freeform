<?php

namespace Solspace\Freeform\Resources\Bundles;

class ResourcesBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/settings/resources.css'];
    }
}
