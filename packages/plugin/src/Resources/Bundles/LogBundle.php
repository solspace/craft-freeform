<?php

namespace Solspace\Freeform\Resources\Bundles;

class LogBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/logs/logs.css'];
    }

    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/logs/index.js'];
    }
}
