<?php

namespace Solspace\Freeform\Resources\Bundles;

class FreeformClientBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/client/vendor.js',
            'js/client/client.js',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
        ];
    }
}
