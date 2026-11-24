<?php

namespace Solspace\Freeform\Resources\Bundles;

class FormMergeBundle extends AbstractFreeformAssetBundle
{
    public function getScripts(): array
    {
        return ['js/scripts/cp/export/form-merge.js'];
    }

    public function getStylesheets(): array
    {
        return ['css/cp/export/form-merge.css'];
    }
}
