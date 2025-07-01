<?php

namespace Solspace\Freeform\Resources\Bundles;

class ComposerBuilderBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/builder/vendor.js',
            'js/builder/builder.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [
            'css/shared/fonts.css',
            'css/cp/forms/edit/builder.css',
        ];
    }
}
