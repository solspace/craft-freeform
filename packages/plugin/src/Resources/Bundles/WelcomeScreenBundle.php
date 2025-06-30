<?php

namespace Solspace\Freeform\Resources\Bundles;

class WelcomeScreenBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/welcome-screen.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [];
    }
}
