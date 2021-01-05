<?php

namespace Solspace\Freeform\Resources\Bundles;

class FormIndexBundle extends AbstractFreeformAssetBundle
{
    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'css/cp/forms/index.css',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return ['js/scripts/cp/forms/index.js'];
    }
}
