<?php

namespace Solspace\Freeform\Resources\Bundles;

class SetupScreenBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/setup.js',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return [];
    }
}
