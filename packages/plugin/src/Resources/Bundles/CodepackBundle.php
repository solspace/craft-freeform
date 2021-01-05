<?php

namespace Solspace\Freeform\Resources\Bundles;

class CodepackBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/code-pack/index.js'];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return ['css/cp/code-pack/code-pack.css'];
    }
}
