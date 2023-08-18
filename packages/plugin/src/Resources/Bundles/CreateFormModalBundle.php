<?php

namespace Solspace\Freeform\Resources\Bundles;

class CreateFormModalBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/form-modal.js',
        ];
    }

    public function getStylesheets(): array
    {
        return [];
    }
}
