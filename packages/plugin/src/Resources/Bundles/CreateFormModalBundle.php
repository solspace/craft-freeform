<?php

namespace Solspace\Freeform\Resources\Bundles;

class CreateFormModalBundle extends AbstractFreeformAssetBundle
{
    /**
     * {@inheritDoc}
     */
    public function getScripts(): array
    {
        return [
            'js/app/vendor.js',
            'js/app/form-modal.js',
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
