<?php

namespace Solspace\Freeform\Resources\Bundles;

class ComposerBuilderBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/app.js',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'css/cp/forms/edit/builder.css',
        ];
    }
}
