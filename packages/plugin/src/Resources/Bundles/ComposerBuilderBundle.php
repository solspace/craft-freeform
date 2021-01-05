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
            'js/builder/vendor.js',
            'js/builder/builder.js',
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
