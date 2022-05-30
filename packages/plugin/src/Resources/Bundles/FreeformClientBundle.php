<?php

namespace Solspace\Freeform\Resources\Bundles;

use craft\helpers\App;

class FreeformClientBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        $clientPath = App::env('FF_CLIENT_PATH') ?? null;
        if ($clientPath) {
            return [$clientPath];
        }

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
