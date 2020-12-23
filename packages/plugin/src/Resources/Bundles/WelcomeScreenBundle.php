<?php

namespace Solspace\Freeform\Resources\Bundles;

class WelcomeScreenBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/welcome-screen.js',
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
